from django.shortcuts import render
from django.http import HttpResponse
from users.models import Users
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt


# Create your views here.
@csrf_exempt
def isUser(request):
    if request.method != "GET":
        return HttpResponse(status=405)
    userId = request.GET.get("user")
    user = Users.objects.filter(user_id=userId).exists()
    if user:
        return HttpResponse("true")
    return HttpResponse("false")


@csrf_exempt
def registerUser(request):
    if request.method != "POST":
        return HttpResponse(status=405)
    userId = request.GET.get("user")
    username = request.GET.get("username")
    try:
        user = Users(user_id=userId, created_at=timezone.now(), username=username)
        user.save()
    except Exception as e:
        return HttpResponse(status=400)

    return HttpResponse(status=200)
