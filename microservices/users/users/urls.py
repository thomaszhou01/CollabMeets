from django.urls import path

from . import views

urlpatterns = [
    path("isUser", views.isUser, name="index"),
    path("registerUser", views.registerUser, name="index"),
]
