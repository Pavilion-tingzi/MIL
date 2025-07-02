# 定时任务相关
import os

from django.utils import timezone
from django.conf import settings
from .models import Setting, CashFlow
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from .utils import *

logger = logging.getLogger(__name__)

def start_scheduler():
    """启动定时任务调度器"""
    if os.environ.get('RUN_MAIN') == 'true':  # 仅Django主进程执行，否则会执行多次
        if not getattr(settings, 'SCHEDULER_STARTED', False):
            scheduler = BackgroundScheduler()
            # 任务一 每日定时扫描用户设置表，根据用户设置自动生成现金流水
            scheduler.add_job(
                execute_recurring_incomes,
                trigger=CronTrigger(hour=2, minute=30),  # 每天01:30执行
                id='recurring_income_job'
            )
            # 任务二 每日定时更新利润统计
            scheduler.add_job(
                generate_profit_reports,  # 使用字符串引用避免导入循环
                trigger=CronTrigger(hour=3, minute=30),
                id='monthly_profit_report',
                replace_existing=True,
            )

            scheduler.start()
            setattr(settings, 'SCHEDULER_STARTED', True)
            logger.info("""
                定时任务已启动:
                - 月度利润统计: 每日 2:30
                - 定期设置处理: 每日 1:30
                """)

# 用户收支设置定时任务
def execute_recurring_incomes():
    """核心逻辑：生成定期收入现金流"""
    today = timezone.now().date()
    logger.info(f"[定时任务] 开始执行，日期: {today}")

    try:
        rules = Setting.objects.filter(
            day_of_month=today.day
        ).exclude(
            last_executed__year=today.year,
            last_executed__month=today.month
        )

        logger.info(f"[定时任务] 待处理规则数: {rules.count()}")

        for rule in rules:
            # 创建现金流记录（自动触发信号生成ProfitDetail）
            CashFlow.objects.create(
                user=rule.user,
                amount=rule.amount,
                subcategory=rule.small_category,
                transaction_type=rule.type,
                transaction_date=today,
                setting=rule
            )
            rule.last_executed = today
            rule.save(update_fields=['last_executed'])

    except Exception as e:
        logger.error(f"[定时任务] 执行失败: {e}", exc_info=True)

# 利润统计表每月1号跑定时任务
def generate_profit_reports():
    """执行月度统计（需在每月1日调用）"""
    logger.info("开始生成上月利润统计...")
    try:
        calculate_monthly_profit()
        logger.info("利润统计生成完成")
    except Exception as e:
        logger.error(f"统计生成失败: {e}", exc_info=True)

