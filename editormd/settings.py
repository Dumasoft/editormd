from django.conf import settings

DEFAULT_MD_URL_API = ''


def get_md_url_api():
    return getattr(settings, 'MD_URL_API', DEFAULT_MD_URL_API)