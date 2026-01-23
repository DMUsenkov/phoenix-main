"""Create qr_codes and qr_code_scan_events tables.

Revision ID: 006
Revises: 005
Create Date: 2026-01-25

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "qr_codes",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column(
            "page_id",
            sa.UUID(),
            sa.ForeignKey("memorial_pages.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("code", sa.String(16), unique=True, nullable=False, index=True),
        sa.Column("is_active", sa.Boolean(), default=True, nullable=False),
        sa.Column(
            "created_by_user_id",
            sa.UUID(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_qr_codes_page_id", "qr_codes", ["page_id"])

    op.create_table(
        "qr_code_scan_events",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column(
            "qr_code_id",
            sa.UUID(),
            sa.ForeignKey("qr_codes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("scanned_at", sa.DateTime(), nullable=False),
        sa.Column("ip", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("referer", sa.String(2048), nullable=True),
    )
    op.create_index(
        "ix_qr_code_scan_events_qr_code_id_scanned_at",
        "qr_code_scan_events",
        ["qr_code_id", "scanned_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_qr_code_scan_events_qr_code_id_scanned_at", table_name="qr_code_scan_events")
    op.drop_table("qr_code_scan_events")
    op.drop_index("ix_qr_codes_page_id", table_name="qr_codes")
    op.drop_table("qr_codes")
