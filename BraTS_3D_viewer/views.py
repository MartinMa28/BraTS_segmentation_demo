from django.shortcuts import render, redirect
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from .forms import MRICaseForm
from .models import MRICase

import os
import torch
import numpy as np
import nibabel as nib
import time
import datetime
import torch.nn.functional as F
from BraTS_3D_viewer.seg_models.unet import UNet
from BraTS_3D_viewer.datasets.BRATS2018 import NormalizeBRATSVal, ToTensorVal
import plotly.plotly as py
import plotly.graph_objs as go


# Create your views here.

def case_list(request):
    # case list
    cases = MRICase.objects.all()
    # upload form
    form = MRICaseForm()

    return render(request, 'BraTS_3D_viewer/case_list.html', context={
        'cases': cases,
        'form': form
    })

def get_cases(request):
    # cases
    cases = MRICase.objects.all()
    cases = list(map(lambda c: {'case_id': c.case_id, 'id': c.id}, cases))

    return JsonResponse({'cases': cases})

def upload_case(request):
    if request.method == 'POST':
        form = MRICaseForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'Success'})
        else:
            return JsonResponse({'status': 'Failed to upload MRI scans.'})

    # for GET request        
    form = MRICaseForm()
    return render(request, 'BraTS_3D_viewer/upload.html', context={
        'form': form
    })

def delete_case(request, pk):
    if request.method == 'GET':
        case = MRICase.objects.get(pk=pk)
        case.delete()

    return redirect('BraTS_3D_viewer:case_list')



def _time_stamp() -> str:
    ts = time.time()
    time_stamp = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')
    return time_stamp

def infer(request, case_name):
    print('{} starts predicting'.format(_time_stamp()))
    upload_dir = 'media/cases'
    seg_dir = 'media/seg'

    if not os.path.exists(seg_dir):
        os.makedirs(seg_dir)
    
    if os.path.exists(os.path.join(seg_dir, case_name + '.npy')):
        return JsonResponse({'status': 'already inferred'})

    model_path = '/home/martin/Documents/semantic_segmentation/UNet-ResidualBlock-Expansion_210_end_to_end_manual/UNet-ResidualBlock-Expansion-BRATS2018-End-to-End_batch6_training_epochs15_Adam_scheduler-step10-gamma1.0_lr5e-05_w_decay3e-05/trained_model.pt'
    device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
    

    t1_path = os.path.join(upload_dir, case_name + '_t1.nii.gz')
    t1ce_path = os.path.join(upload_dir, case_name + '_t1ce.nii.gz')
    t2_path = os.path.join(upload_dir, case_name + '_t2.nii.gz')
    flair_path = os.path.join(upload_dir, case_name + '_flair.nii.gz')

    t1 = nib.load(t1_path).get_data()
    t1ce = nib.load(t1ce_path).get_data()
    t2 = nib.load(t2_path).get_data()
    flair = nib.load(flair_path).get_data()
    sc = np.array([t1, t1ce, t2, flair]).transpose((3, 0, 1, 2))
    assert sc.shape == (155, 4, 240, 240)

    model = UNet(n_channels=4, n_classes=4, residual=True, expansion=2)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()

    preds = np.zeros((155, 240, 240))

    for i in range(155):
        slice_i = sc[i]
        assert slice_i.shape == (4, 240, 240)

        normalize = NormalizeBRATSVal()
        totensor = ToTensorVal()

        slice_i = normalize(slice_i)
        slice_i = totensor(slice_i)

        # unsqueeze the dimension to 4, NxCxHxW
        slice_i = torch.unsqueeze(slice_i, dim=0)
        slice_i = slice_i.to(device)
        with torch.no_grad():
            output = model(slice_i)
            pred = torch.argmax(F.softmax(output, dim=1), dim=1, keepdim=True)
        
        # squeeze the dimension down to 2, HxW
        pred = torch.squeeze(pred)
        pred = pred.cpu().numpy()
        preds[i] = pred
    
    print('{} finishes predicting'.format(_time_stamp()))
    print(np.unique(preds), preds.shape)
    
    np.save(os.path.join(seg_dir, case_name), preds)
    
    preds = np.unique(preds).tolist()
    # release GPU memory
    del model
    del slice_i
    del pred
    del output
    
    torch.cuda.empty_cache()

    return JsonResponse({'labels': preds})


def view3D(request, case_name):
    seg_dir = 'media/seg'
    try:
        preds = np.load(os.path.join(seg_dir, case_name + '.npy'))
        assert preds.shape == (155, 240, 240)

        print('{} start preparing'.format(_time_stamp()))
        et_indices = np.argwhere(preds == 3.)
        et_xs = [ind[0] for ind in et_indices]
        et_ys = [ind[1] for ind in et_indices]
        et_zs = [ind[2] for ind in et_indices]

        edema_indices = np.argwhere(preds == 2.)
        edema_xs = [ind[0] for ind in edema_indices]
        edema_ys = [ind[1] for ind in edema_indices]
        edema_zs = [ind[2] for ind in edema_indices]

        necrotic_indices = np.argwhere(preds == 1.)
        necrotic_xs = [ind[0] for ind in necrotic_indices]
        necrotic_ys = [ind[1] for ind in necrotic_indices]
        necrotic_zs = [ind[2] for ind in necrotic_indices]

        seg_xs = et_xs + edema_xs + necrotic_xs
        seg_ys = et_ys + edema_ys + necrotic_ys
        seg_zs = et_zs + edema_zs + necrotic_zs
        seg_color = [3] * len(et_xs) + [2] * len(edema_xs) + [1] * len(necrotic_xs)
        print('{} finish preparing'.format(_time_stamp()))

        trace_seg = go.Scatter3d(
            x=seg_xs,
            y=seg_ys,
            z=seg_zs,
            mode='markers',
            marker={
                'size': 3,
                'color': seg_color,
                'colorscale': 'Viridis',
                'opacity': 0.8
            }
        )

        layout = go.Layout(
            margin=dict(
                l=0,
                r=0,
                b=0,
                t=0
            )
        )

        data_seg = [trace_seg]
        fig_seg = go.Figure(data=data_seg, layout=layout)
        py.iplot(fig_seg, filename='3D-Glioma-segmentation')
        print('{} finish plotting'.format(_time_stamp()))

        return JsonResponse({'status': 'normal'})
    except:
        return JsonResponse({'status': 'internal_error'})


def get_labels(request, case_name):
    seg_dir = 'media/seg'
    try:
        preds = np.load(os.path.join(seg_dir, case_name + '.npy'))
        assert preds.shape == (155, 240, 240)

        print('{} start preparing'.format(_time_stamp()))
        et_indices = np.argwhere(preds == 3.)
        et_xs = [int(ind[0]) for ind in et_indices]
        et_ys = [int(ind[1]) for ind in et_indices]
        et_zs = [int(ind[2]) for ind in et_indices]

        edema_indices = np.argwhere(preds == 2.)
        edema_xs = [int(ind[0]) for ind in edema_indices]
        edema_ys = [int(ind[1]) for ind in edema_indices]
        edema_zs = [int(ind[2]) for ind in edema_indices]

        necrotic_indices = np.argwhere(preds == 1.)
        necrotic_xs = [int(ind[0]) for ind in necrotic_indices]
        necrotic_ys = [int(ind[1]) for ind in necrotic_indices]
        necrotic_zs = [int(ind[2]) for ind in necrotic_indices]

        return JsonResponse({
            'et_xs': et_xs,
            'et_ys': et_ys,
            'et_zs': et_zs,
            'edema_xs': edema_xs,
            'edema_ys': edema_ys,
            'edema_zs': edema_zs,
            'necrotic_xs': necrotic_xs,
            'necrotic_ys': necrotic_ys,
            'necrotic_zs': necrotic_zs,
            'et_length': len(et_xs),
            'edema_length': len(edema_xs),
            'necrotic_length': len(necrotic_xs) 
        })
    except:
        return JsonResponse({'status': 'internal_error'})
