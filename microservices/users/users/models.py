from django.db import models


# Create your models here.
class Users(models.Model):
    user_id = models.CharField(unique=True, max_length=255)
    created_at = models.DateTimeField()
    username = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "users"
