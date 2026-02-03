"""Moderation platform - add org_id, priority to tasks and create audit_events

Revision ID: 009_moderation_platform
Revises: 008_organizations
Create Date: 2026-01-25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '009_moderation_platform'
down_revision: Union[str, None] = '007'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column('moderation_tasks', sa.Column('org_id', sa.UUID(), nullable=True))
    op.add_column('moderation_tasks', sa.Column('priority', sa.Integer(), nullable=False, server_default='0'))

    op.create_foreign_key(
        'fk_moderation_tasks_org_id',
        'moderation_tasks', 'organizations',
        ['org_id'], ['id'],
        ondelete='SET NULL'
    )

    op.create_index('ix_moderation_tasks_org_id', 'moderation_tasks', ['org_id'])
    op.create_index('ix_moderation_tasks_status_created', 'moderation_tasks', ['status', 'created_at'])
    op.create_index('ix_moderation_tasks_org_status_created', 'moderation_tasks', ['org_id', 'status', 'created_at'])


    op.create_table(
        'audit_events',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('event_type', sa.String(100), nullable=False),
        sa.Column('actor_user_id', sa.UUID(), nullable=True),
        sa.Column('entity_type', sa.String(50), nullable=True),
        sa.Column('entity_id', sa.UUID(), nullable=True),
        sa.Column('org_id', sa.UUID(), nullable=True),
        sa.Column('payload', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['actor_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_index('ix_audit_events_event_type', 'audit_events', ['event_type'])
    op.create_index('ix_audit_events_actor_user_id', 'audit_events', ['actor_user_id'])
    op.create_index('ix_audit_events_org_id', 'audit_events', ['org_id'])
    op.create_index('ix_audit_events_created_at', 'audit_events', ['created_at'])
    op.create_index('ix_audit_events_entity', 'audit_events', ['entity_type', 'entity_id'])
    op.create_index('ix_audit_events_type_created', 'audit_events', ['event_type', 'created_at'])


def downgrade() -> None:
    op.drop_table('audit_events')

    op.drop_index('ix_moderation_tasks_org_status_created', 'moderation_tasks')
    op.drop_index('ix_moderation_tasks_status_created', 'moderation_tasks')
    op.drop_index('ix_moderation_tasks_org_id', 'moderation_tasks')
    op.drop_constraint('fk_moderation_tasks_org_id', 'moderation_tasks', type_='foreignkey')
    op.drop_column('moderation_tasks', 'priority')
    op.drop_column('moderation_tasks', 'org_id')
