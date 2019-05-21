from django.shortcuts import render, redirect
from django.core.files.storage import FileSystemStorage
from .forms import MRICaseForm
from .models import MRICase

# Create your views here.
def index(request):
    ctx = {}
    if request.method == 'POST':
        uploaded_files = request.FILES.getlist('nii_files')
        ctx['files'] = []
        fs = FileSystemStorage()
        for f in uploaded_files:
            fs.save(f.name, f)
            ctx['files'].append(f.name)
    
    return render(request, 'BraTS_3D_viewer/index.html', context=ctx)

def case_list(request):
    cases = MRICase.objects.all()
    return render(request, 'BraTS_3D_viewer/case_list.html', context={
        'cases': cases
    })

def upload_case(request):
    if request.method == 'POST':
        form = MRICaseForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('BraTS_3D_viewer:case_list')

    # for GET request        
    form = MRICaseForm()
    return render(request, 'BraTS_3D_viewer/upload.html', context={
        'form': form
    })

