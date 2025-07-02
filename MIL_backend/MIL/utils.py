from dateutil.relativedelta import relativedelta
from .models import *
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum

# 计算摊销明细
def calculate_amortization(cash_flow):
    """计算摊销明细"""
    amortization_details = []

    if not cash_flow.is_amortized or not cash_flow.amortization_months:
        # 非摊销记录，直接创建一条明细
        detail = ProfitDetail(
            cash_flow=cash_flow,
            original_amount=cash_flow.amount,
            amortized_amount=cash_flow.amount,
            transaction_date=cash_flow.transaction_date,
            amortization_date=cash_flow.transaction_date,
            transaction_type=cash_flow.transaction_type,
            subcategory=cash_flow.subcategory,
            is_amortized=False,
            user=cash_flow.user,
            notes=cash_flow.notes
        )
        amortization_details.append(detail)
    else:
        # 摊销记录，按月分摊
        monthly_amount = cash_flow.amount / cash_flow.amortization_months
        start_date = cash_flow.amortization_start_date or cash_flow.transaction_date

        for i in range(cash_flow.amortization_months):
            amortization_date = start_date + relativedelta(months=i)

            detail = ProfitDetail(
                cash_flow=cash_flow,
                original_amount=cash_flow.amount,
                amortized_amount=monthly_amount,
                transaction_date=cash_flow.transaction_date,
                amortization_date=amortization_date,
                transaction_type=cash_flow.transaction_type,
                subcategory=cash_flow.subcategory,
                is_amortized=True,
                amortization_period=cash_flow.amortization_months,
                current_period=i + 1,
                user=cash_flow.user,
                notes=f"{cash_flow.notes} (摊销 {i + 1}/{cash_flow.amortization_months})"
            )
            amortization_details.append(detail)

    return amortization_details

# 计算利润统计
def calculate_monthly_profit():
    """更新近6个月的利润统计数据"""
    today = timezone.now().date()
    six_months_ago = today - relativedelta(months=6)

    # 获取所有用户
    users = CustomUser.objects.all()

    for user in users:
        current_date = six_months_ago.replace(day=1)
        while current_date <= today:
            year = current_date.year
            month = current_date.month
            month_start = current_date.replace(day=1)
            month_end = (month_start + relativedelta(months=1)) - timedelta(days=1)

            # 获取或创建统计记录（先查询再更新，避免并发问题）
            stat = ProfitStat.objects.filter(
                user=user,
                year=year,
                month=month
            ).first()

            # 查询该用户该月的收入数据
            income_data = ProfitDetail.objects.filter(
                user=user,
                amortization_date__gte=month_start,
                amortization_date__lte=month_end,
                transaction_type__in=[2, 3]  # 2和3是收入类型
            ).aggregate(total=Sum('amortized_amount'))

            # 查询该用户该月的支出数据
            expense_data = ProfitDetail.objects.filter(
                user=user,
                amortization_date__gte=month_start,
                amortization_date__lte=month_end,
                transaction_type__in=[1]  # 1是支出类型
            ).aggregate(total=Sum('amortized_amount'))

            total_income = income_data['total'] or 0
            total_expense = expense_data['total'] or 0
            # 更新或创建统计记录
            if stat:
                stat.total_income = total_income
                stat.total_expense = total_expense
                stat.profit = stat.total_income - stat.total_expense
                stat.save()
            else:
                ProfitStat.objects.update_or_create(
                    year=year,
                    month=month,
                    user=user,
                    total_income=total_income,
                    total_expense=total_expense,
                    profit = total_income - total_expense,
                )
            # 移动到下个月
            current_date = month_start + relativedelta(months=1)

# 计算当前用户利润统计
def calculate_current_user_monthly_profit(user):
    """更新近6个月的利润统计数据"""
    today = timezone.now().date()
    six_months_ago = today - relativedelta(months=6)
    current_date = six_months_ago.replace(day=1)
    users_to_calculate = [user]  # 默认只计算当前用户

    if user.group:
        # 如果用户有团队，则获取团队所有成员（包括自己）
        users_to_calculate = CustomUser.objects.filter(group=user.group)

    while current_date <= today:
        year = current_date.year
        month = current_date.month
        month_start = current_date.replace(day=1)
        month_end = (month_start + relativedelta(months=1)) - timedelta(days=1)

        for current_user in users_to_calculate:
            # 获取或创建统计记录（先查询再更新，避免并发问题）
            stat = ProfitStat.objects.filter(
                user=current_user,
                year=year,
                month=month
            ).first()

            # 查询该用户该月的收入数据
            income_data = ProfitDetail.objects.filter(
                user=current_user,
                amortization_date__gte=month_start,
                amortization_date__lte=month_end,
                transaction_type__in=[2, 3]  # 2和3是收入类型
            ).aggregate(total=Sum('amortized_amount'))

            # 查询该用户该月的支出数据
            expense_data = ProfitDetail.objects.filter(
                user=current_user,
                amortization_date__gte=month_start,
                amortization_date__lte=month_end,
                transaction_type__in=[1]  # 1是支出类型
            ).aggregate(total=Sum('amortized_amount'))

            total_income = income_data['total'] or 0
            total_expense = expense_data['total'] or 0
            # 更新或创建统计记录
            if stat:
                stat.total_income = total_income
                stat.total_expense = total_expense
                stat.profit = stat.total_income - stat.total_expense
                stat.save()
            else:
                ProfitStat.objects.update_or_create(
                    year=year,
                    month=month,
                    user=current_user,
                    total_income=total_income,
                    total_expense=total_expense,
                    profit=total_income - total_expense,
                )
            # 移动到下个月
            current_date = month_start + relativedelta(months=1)