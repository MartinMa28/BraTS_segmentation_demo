from django.urls import path
from . import views

app_name = 'BraTS_3D_viewer'
urlpatterns = [
    path('', views.index, name='index')
]