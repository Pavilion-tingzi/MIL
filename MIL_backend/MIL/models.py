from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

# Create your models here.
class CustomUser(AbstractUser):
    avatar = models.ImageField(upload_to="users/",default='')
    create_time = models.DateTimeField(auto_now=True)
    unicode = models.CharField(max_length=50,unique=True,editable=False)
    def save(self, *args, **kwargs):
        if not self.unicode:  # 仅在新建时生成
            self.unicode = uuid.uuid4().hex[:10]  # 取uuid前10位
        super().save(*args, **kwargs)
    nickname = models.CharField(max_length=50)

    class Meta:
        verbose_name_plural = "用户权限表"

    def __str__(self):
        return self.username