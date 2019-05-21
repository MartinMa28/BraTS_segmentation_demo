from django.shortcuts import render
from django.core.files.storage import FileSystemStorage

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
    return render(request, 'BraTS_3D_viewer/case_list.html')

def upload_case(request):
    return render(request, 'BraTS_3D_viewer/upload.html')

