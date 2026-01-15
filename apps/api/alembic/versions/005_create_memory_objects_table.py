"""Create memory_objects table.

Revision ID: 005
Revises: 004
Create Date: 2026-01-25
"""

from alembic import op
import sqlalchemy as sa


revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "memory_objects",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column(
            "page_id",
            sa.UUID(),
            sa.ForeignKey("memorial_pages.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("lat", sa.Float, nullable=False),
        sa.Column("lng", sa.Float, nullable=False),
        sa.Column("address", sa.String(512), nullable=True),
        sa.Column(
            "status",
            sa.String(20),
            nullable=False,
            server_default="draft",
        ),
        sa.Column(
            "visibility",
            sa.String(20),
            nullable=False,
            server_default="public",
        ),
        sa.Column(
            "owner_user_id",
            sa.UUID(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_by_user_id",
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
        sa.Column(
            "updated_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_index(
        "ix_memory_objects_page_created",
        "memory_objects",
        ["page_id", "created_at"],
    )
    op.create_index(
        "ix_memory_objects_status",
        "memory_objects",
        ["status"],
    )
    op.create_index(
        "ix_memory_objects_lat_lng",
        "memory_objects",
        ["lat", "lng"],
    )
    op.create_index(
        "ix_memory_objects_owner",
        "memory_objects",
        ["owner_user_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_memory_objects_owner", table_name="memory_objects")
    op.drop_index("ix_memory_objects_lat_lng", table_name="memory_objects")
    op.drop_index("ix_memory_objects_status", table_name="memory_objects")
    op.drop_index("ix_memory_objects_page_created", table_name="memory_objects")
    op.drop_table("memory_objects")
