"""Add org_project_id to memorial_pages

Revision ID: 013
Revises: 012
Create Date: 2026-01-25
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '013'
down_revision = '012'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'memorial_pages',
        sa.Column('org_project_id', postgresql.UUID(as_uuid=True), nullable=True)
    )
    op.create_foreign_key(
        'fk_memorial_pages_org_project_id',
        'memorial_pages',
        'org_projects',
        ['org_project_id'],
        ['id'],
        ondelete='SET NULL'
    )
    op.create_index(
        'ix_memorial_pages_org_project',
        'memorial_pages',
        ['org_project_id']
    )


def downgrade() -> None:
    op.drop_index('ix_memorial_pages_org_project', table_name='memorial_pages')
    op.drop_constraint('fk_memorial_pages_org_project_id', 'memorial_pages', type_='foreignkey')
    op.drop_column('memorial_pages', 'org_project_id')
