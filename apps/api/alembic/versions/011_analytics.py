"""Analytics events and daily aggregates tables.

Revision ID: 011_analytics
Revises: 010_genealogy
Create Date: 2026-01-25
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "011_analytics"
down_revision = "010_genealogy"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "analytics_events",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("event_type", sa.String(50), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("org_id", sa.UUID(), nullable=True),
        sa.Column("page_id", sa.UUID(), nullable=True),
        sa.Column("object_id", sa.UUID(), nullable=True),
        sa.Column("qr_code_id", sa.UUID(), nullable=True),
        sa.Column("actor_user_id", sa.UUID(), nullable=True),
        sa.Column("anon_id", sa.String(64), nullable=True),
        sa.Column("session_id", sa.String(64), nullable=True),
        sa.Column("ip_hash", sa.String(64), nullable=True),
        sa.Column("user_agent", sa.String(512), nullable=True),
        sa.Column("referer", sa.String(1024), nullable=True),
        sa.Column("properties", postgresql.JSONB(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["org_id"], ["organizations.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["page_id"], ["memorial_pages.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["object_id"], ["memory_objects.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["qr_code_id"], ["qr_codes.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["actor_user_id"], ["users.id"], ondelete="SET NULL"),
    )

    op.create_index("ix_analytics_events_event_type", "analytics_events", ["event_type"])
    op.create_index("ix_analytics_events_occurred_at", "analytics_events", ["occurred_at"])
    op.create_index("ix_analytics_events_org_id", "analytics_events", ["org_id"])
    op.create_index("ix_analytics_events_page_id", "analytics_events", ["page_id"])
    op.create_index("ix_analytics_events_qr_code_id", "analytics_events", ["qr_code_id"])
    op.create_index("ix_analytics_events_anon_id", "analytics_events", ["anon_id"])
    op.create_index("ix_analytics_events_event_type_occurred_at", "analytics_events", ["event_type", "occurred_at"])
    op.create_index("ix_analytics_events_org_id_occurred_at", "analytics_events", ["org_id", "occurred_at"])
    op.create_index("ix_analytics_events_page_id_occurred_at", "analytics_events", ["page_id", "occurred_at"])
    op.create_index("ix_analytics_events_qr_code_id_occurred_at", "analytics_events", ["qr_code_id", "occurred_at"])

    op.create_table(
        "analytics_daily",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("org_id", sa.UUID(), nullable=True),
        sa.Column("page_id", sa.UUID(), nullable=True),
        sa.Column("object_id", sa.UUID(), nullable=True),
        sa.Column("metric", sa.String(50), nullable=False),
        sa.Column("value", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["org_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["page_id"], ["memorial_pages.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["object_id"], ["memory_objects.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("date", "org_id", "page_id", "object_id", "metric", name="uq_analytics_daily_composite"),
    )

    op.create_index("ix_analytics_daily_date", "analytics_daily", ["date"])
    op.create_index("ix_analytics_daily_org_id", "analytics_daily", ["org_id"])
    op.create_index("ix_analytics_daily_date_org_id", "analytics_daily", ["date", "org_id"])
    op.create_index("ix_analytics_daily_date_page_id", "analytics_daily", ["date", "page_id"])


def downgrade() -> None:
    op.drop_table("analytics_daily")
    op.drop_table("analytics_events")
