from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class MilConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'MIL'

    def ready(self):
        # 注册信号（始终执行）
        import MIL.signals
        logger.info("[应用初始化] 信号已注册")
        self.start_background_tasks()

    def start_background_tasks(self):
        """启动后台任务（定时任务）"""
        try:
            from MIL.cron import start_scheduler
            start_scheduler()
        except Exception as e:
            logger.error(f"[应用初始化] 定时任务启动失败: {e}", exc_info=True)