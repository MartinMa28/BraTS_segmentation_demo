from django.urls import path
from . import views

app_name = 'BraTS_3D_viewer'
urlpatterns = [
    path('', views.index, name='index'),
    path('cases/', views.case_list, name='case_list'),
    path('cases/upload', views.upload_case, name='case_upload'),
    path('inference/<str:case_name>', views.infer),
]