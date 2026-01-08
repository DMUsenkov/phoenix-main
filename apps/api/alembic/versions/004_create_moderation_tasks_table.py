"""Create moderation_tasks table.

Revision ID: 004
Revises: 003
Create Date: 2026-01-25
"""

from alembic import op
import sqlalchemy as sa


revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "moderation_tasks",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column(
            "entity_type",
            sa.String(20),
            nullable=False,
        ),
        sa.Column("entity_id", sa.UUID(), nullable=False),
        sa.Column(
            "status",
            sa.String(20),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("reason", sa.Text, nullable=True),
        sa.Column(
            "created_by_user_id",
            sa.UUID(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "moderator_user_id",
            sa.UUID(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("decided_at", sa.DateTime, nullable=True),
    )

    op.create_index(
        "ix_moderation_tasks_type_status_created",
        "moderation_tasks",
        ["entity_type", "status", "created_at"],
    )
    op.create_index(
        "ix_moderation_tasks_entity_id",
        "moderation_tasks",
        ["entity_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_moderation_tasks_entity_id", table_name="moderation_tasks")
    op.drop_index("ix_moderation_tasks_type_status_created", table_name="moderation_tasks")
    op.drop_table("moderation_tasks")
