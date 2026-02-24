"""Add org_admin/org_user roles and project location

Revision ID: 012
Revises: 0f0780efffd1
Create Date: 2026-01-25

Changes:
- Update user_role enum: remove 'org', add 'org_admin' and 'org_user'
- Add lat, lng, address columns to org_projects table
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "012"
down_revision: Union[str, None] = "0f0780efffd1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column("org_projects", sa.Column("lat", sa.Float(), nullable=True))
    op.add_column("org_projects", sa.Column("lng", sa.Float(), nullable=True))
    op.add_column("org_projects", sa.Column("address", sa.String(512), nullable=True))


    op.create_index("ix_org_projects_location", "org_projects", ["lat", "lng"])


    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'org_user'")
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'org_admin'")


def downgrade() -> None:

    op.drop_index("ix_org_projects_location", table_name="org_projects")


    op.drop_column("org_projects", "address")
    op.drop_column("org_projects", "lng")
    op.drop_column("org_projects", "lat")


    op.execute("UPDATE users SET role = 'org' WHERE role IN ('org_admin', 'org_user')")


