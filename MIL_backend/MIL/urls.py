from django.contrib import admin
from django.urls import path,include
from django.views.static import serve
from django.conf import settings
from rest_framework.routers import SimpleRouter
from rest_framework_simplejwt.views import TokenRefreshView
from MIL.views import LoginView, UserInfo, RegisterView, AvatarUploadView, CashFlowViewSet, CategoryViewSet, \
    change_password_api, GroupMembersAPIView, MessageListViewSet, MessageCreateViewSet, MessageUpdateViewSet, \
    CreateGroupAPIView, UserGroupUpdateAPIView, UserGroupDeleteAPIView, DeleteGroupAPIView, SettingViewSet, \
    CashFlowSummaryView, ProfitStatView, BigCategoryViewSet, ProfitDetailView, SendEmailCodeView, NoticeView

router = SimpleRouter()
router.register(prefix="users",viewset=UserInfo,basename="users")
router.register(prefix="uploadAvatar",viewset=AvatarUploadView,basename="uploadAvatar")
router.register(prefix="cashFlow",viewset=CashFlowViewSet,basename="cashFlow")
router.register(prefix="category",viewset=CategoryViewSet,basename="category")
# 大类增删改查
router.register(prefix="big_category",viewset=BigCategoryViewSet,basename="big_category")
router.register(prefix="group_members",viewset=GroupMembersAPIView,basename="group_members")
# 查询用户收到的所有团队邀请消息
router.register(prefix="messageList",viewset=MessageListViewSet,basename="messageList")
# 发出一条组队邀请消息
router.register(prefix="messageCreate",viewset=MessageCreateViewSet,basename="messageCreate")
# 更改组队邀请消息状态，接受或拒绝
router.register(prefix="messageUpdate",viewset=MessageUpdateViewSet,basename="messageUpdate")
# 创建团队
router.register(prefix="createGroup",viewset=CreateGroupAPIView,basename="createGroup")
# 添加团队成员
router.register(prefix="userGroupUpdate",viewset=UserGroupUpdateAPIView,basename="userGroupUpdate")
# 删除团队成员
router.register(prefix="userGroupDelete",viewset=UserGroupDeleteAPIView,basename="userGroupDelete")
# 解散团队
router.register(prefix="deleteGroup",viewset=DeleteGroupAPIView,basename="deleteGroup")
# 本人设置增删改查
router.register(prefix="settings",viewset=SettingViewSet,basename="settings")
# 现金流水汇总
router.register(prefix="cashFlowSummary",viewset=CashFlowSummaryView,basename="cashFlowSummary")
# 利润统计
router.register(prefix="profitStat",viewset=ProfitStatView,basename="profitStat")
# 利润明细
router.register(prefix="profitDetail",viewset=ProfitDetailView,basename="profitDetail")
# 站内消息通知
router.register(prefix="notice",viewset=NoticeView,basename="NoticeDetail")
urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('api/send_email_code/', SendEmailCodeView.as_view(), name='send_email_code'),
    path('api/change-password/', change_password_api, name='change_password_api'),

]