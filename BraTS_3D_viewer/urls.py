from django.urls import path
from . import views

app_name = 'BraTS_3D_viewer'
urlpatterns = [
    path('', views.case_list, name='case_list'),
    path('cases/', views.get_cases, name='get_cases'),
    path('cases/upload', views.upload_case, name='case_upload'),
    path('cases/delete/<int:pk>', views.delete_case, name='case_delete'),
    path('inference/<str:case_name>', views.infer, name='inference'),
    path('view/<str:case_name>', views.view3D),
    path('labels/<str:case_name>', views.get_labels, name='labels'),
]