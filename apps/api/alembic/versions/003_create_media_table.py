"""Create media table

Revision ID: 003
Revises: 002
Create Date: 2026-01-25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "media",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("page_id", sa.UUID(), nullable=False),
        sa.Column(
            "type",
            sa.Enum("image", "video", name="media_type"),
            nullable=False,
        ),
        sa.Column("object_key", sa.String(length=512), nullable=False),
        sa.Column("original_url", sa.String(length=1024), nullable=True),
        sa.Column("preview_url", sa.String(length=1024), nullable=True),
        sa.Column("mime_type", sa.String(length=128), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("duration_seconds", sa.Float(), nullable=True),
        sa.Column("checksum", sa.String(length=128), nullable=True),
        sa.Column("uploaded_by_user_id", sa.UUID(), nullable=True),
        sa.Column(
            "moderation_status",
            sa.Enum("pending", "approved", "rejected", name="moderation_status"),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_media")),
        sa.ForeignKeyConstraint(
            ["page_id"],
            ["memorial_pages.id"],
            name=op.f("fk_media_page_id_memorial_pages"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["uploaded_by_user_id"],
            ["users.id"],
            name=op.f("fk_media_uploaded_by_user_id_users"),
            ondelete="SET NULL",
        ),
        sa.UniqueConstraint("object_key", name=op.f("uq_media_object_key")),
    )

    op.create_index("ix_media_page_created", "media", ["page_id", "created_at"])
    op.create_index("ix_media_page_type", "media", ["page_id", "type"])


def downgrade() -> None:
    op.drop_index("ix_media_page_type", table_name="media")
    op.drop_index("ix_media_page_created", table_name="media")
    op.drop_table("media")

    sa.Enum(name="moderation_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="media_type").drop(op.get_bind(), checkfirst=True)
