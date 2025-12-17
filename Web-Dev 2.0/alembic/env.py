from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from routers.app.config import settings




# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
#target_metadata = None
import os, sys
from dotenv import load_dotenv

# 1) Make sure your project root is on the path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# 2) Load .env for DATABASE_URL if needed
load_dotenv()

from database import Base  # your Base = declarative_base()
from models import Base as _  # ensure models are registered
target_metadata = Base.metadata

# 3) If you want to pull URL from env:
#config.set_main_option('sqlalchemy.url',os.getenv('DATABASE_URL'))
#from routers.app.config import settings  # wherever your DB URL is defined
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

#config.set_main_option("sqlalchemy.url", "your_db_url")



from routers.app.config import settings  # wherever your DB URL is defined

#config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)



# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


from sqlalchemy import engine_from_config, pool
from alembic import context
from routers.app.config import settings  # your BaseSettings loader

# this is the MetaData from your models
from models import Base  # or wherever your Base lives
target_metadata = Base.metadata

def run_migrations_online():
    # grab the alembic Config object
    cfg = context.config

    # instead of cfg.set_main_option, pull the .env value directly
    db_url = settings.DATABASE_URL

    # construct a connectable using that URL
    connectable = engine_from_config(
        configuration={},
        prefix="sqlalchemy.",
        url=db_url,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,      # optional, to detect column‐type changes
            render_as_batch=True,   # optional, for SQLite support
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    # leave your offline logic alone
    ...
else:
    run_migrations_online()
