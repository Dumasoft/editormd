from django.urls import path

from .views import *

urlpatterns = [
    path('api/v1/md_to_html', markdown_to_html, name='md_to_html', ),
]
