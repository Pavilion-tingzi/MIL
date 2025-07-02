# 利润表数据同步
from django.db import transaction
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import CashFlow, ProfitDetail, CustomUser, BigCategory, SmallCategory
from .utils import calculate_amortization
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=CashFlow)
def handle_cashflow_save(sender, instance, **kwargs):
    """CashFlow保存时自动生成ProfitDetail"""

    def _sync():
        logger.info(f"[信号] 同步利润明细，CashFlow ID: {instance.id}")
        ProfitDetail.objects.filter(cash_flow=instance).delete()
        details = calculate_amortization(instance)
        ProfitDetail.objects.bulk_create(details)

    transaction.on_commit(_sync)  # 事务安全


@receiver(pre_delete, sender=CashFlow)
def handle_cashflow_delete(sender, instance, **kwargs):
    """CashFlow删除时清理关联ProfitDetail"""
    ProfitDetail.objects.filter(cash_flow=instance).delete()


@receiver(post_save, sender=CustomUser)
def handle_user_save(sender, instance, created, **kwargs):
    """用户创建后自动初始化默认分类"""
    if not created:  # 仅在新用户创建时执行
        return

    # 分类配置字典（类型: (大类名称, [小类列表]）
    categories = {
        1: [  # 支出
            ("餐饮", ["早餐", "中餐", "晚餐", "食材","奶茶","零食","调味品"]),
            ("交通", ["公交地铁", "打车", "加油", "停车费","高速路费","飞机","火车","大巴"]),
            ("住宿", ["房租", "房贷", "物业/水电煤","维修"]),
            ("购物", ["服装鞋帽", "电器", "数码", "家具"]),
            ("日常", ["理发", "日用品"]),
            ("宠物", ["宠物"]),
            ("医疗", ["就诊", "药品"]),
            ("旅游", ["路费", "酒店", "餐饮", "门票","礼品"]),
            ("娱乐", ["电影票", "健身", "演唱会", "展览","游戏活动","会员"]),
            ("人情", ["红包", "送礼", "请客", "孝心"]),
            ("学习", ["书籍", "网课", "培训"]),
        ],
        2: [  # 收入
            ("收入", ["工资", "奖金", "兼职","投资","房租收入"]),
        ],
        3: [  # 物品收入
            ("物品收入", ["礼物", "闲置转让" ,"公司福利"]),
        ]
    }

    ICON_MAPPING = {
        # 支出
        "早餐": "breakfast.png",
        "中餐": "lunch.png",
        "晚餐": "dinner.png",
        "食材":"eat.png",
        "奶茶":"milktea.png",
        "零食":"snack.png",
        "调味品":"season.png",
        "公交地铁": "metro.png",
        "打车":"taxi.png",
        "加油":"fuel.png",
        "停车费":"park.png",
        "高速路费":"highway.png",
        "火车":"train.png",
        "飞机":"plane.png",
        "房租":"rent.png",
        "服装鞋帽":"clothing.png",
        "日用品":"daily.png",
        "宠物":"pet.png",
        "就诊":"hospital.png",
        "药品":"hospital.png",
        "路费":"travel.png",
        "酒店":"travel.png",
        "餐饮":"travel.png",
        "门票":"travel.png",
        "礼品":"travel.png",
        "电影票":"happy.png",
        "健身":"happy.png",
        "演唱会":"happy.png",
        "展览":"happy.png",
        "游戏活动":"happy.png",
        "会员":"member.png",
        "红包":"relationship.png",
        "送礼":"relationship.png",
        "请客":"relationship.png",
        "孝心":"relationship.png",
        "书籍":"study.png",
        "网课":"study.png",
        "培训":"study.png",
        "工资":"salary.png",
        "奖金":"salary.png",
        "兼职":"salary.png",
        "投资":"salary.png",
        "房租收入":"rentincome.png",
        "礼物":"gift.png",
        "闲置转让":"gift.png",
        "公司福利":"gift.png",
        "_default": "default.png"  # 默认图标文件
    }

    # 批量创建分类
    for category_type, big_categories in categories.items():
        for big_name, small_names in big_categories:
            # 创建大类
            big_category = BigCategory.objects.create(
                name=big_name,
                type=category_type,
                user=instance
            )
            # 批量创建小类
            SmallCategory.objects.bulk_create([
                SmallCategory(
                    name=name,
                    BigCategory=big_category,
                    user=instance,
                    icon="icons/"+ICON_MAPPING.get(name, ICON_MAPPING["_default"])
                ) for name in small_names
            ])