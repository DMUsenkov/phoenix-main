"""add_is_primary_to_media

Revision ID: 0f0780efffd1
Revises: 011_analytics
Create Date: 2026-01-25 01:59:21.645614

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '0f0780efffd1'
down_revision: Union[str, None] = '011_analytics'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.alter_column('family_relationships', 'relation_type',
               existing_type=sa.VARCHAR(length=50),
               type_=sa.Enum('MOTHER', 'FATHER', 'BROTHER', 'SISTER', 'SPOUSE', 'SON', 'DAUGHTER', 'CHILD', 'PARENT', 'SIBLING', name='relation_type', native_enum=False),
               existing_nullable=False)
    op.alter_column('family_relationships', 'status',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.Enum('PENDING', 'ACTIVE', 'REJECTED', name='relationship_status', native_enum=False),
               existing_nullable=False,
               existing_server_default=sa.text("'pending'::character varying"))
    op.add_column('media', sa.Column('is_primary', sa.Boolean(), nullable=False))
    op.alter_column('media', 'type',
               existing_type=postgresql.ENUM('image', 'video', name='media_type'),
               type_=sa.Enum('IMAGE', 'VIDEO', name='media_type', native_enum=False),
               existing_nullable=False)
    op.alter_column('media', 'moderation_status',
               existing_type=postgresql.ENUM('pending', 'approved', 'rejected', name='moderation_status'),
               type_=sa.Enum('PENDING', 'APPROVED', 'REJECTED', name='moderation_status', native_enum=False),
               existing_nullable=False,
               existing_server_default=sa.text("'pending'::moderation_status"))
    op.drop_index(op.f('ix_memorial_pages_owner_org'), table_name='memorial_pages')
    op.drop_constraint(op.f('uq_memorial_pages_slug'), 'memorial_pages', type_='unique')
    op.alter_column('memory_objects', 'type',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.Enum('TREE', 'PLAQUE', 'PLACE', name='object_type', native_enum=False),
               existing_nullable=False)
    op.alter_column('memory_objects', 'status',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.Enum('DRAFT', 'ON_MODERATION', 'PUBLISHED', 'REJECTED', 'ARCHIVED', name='object_status', native_enum=False),
               existing_nullable=False,
               existing_server_default=sa.text("'draft'::character varying"))
    op.alter_column('memory_objects', 'visibility',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.Enum('PUBLIC', 'UNLISTED', 'PRIVATE', name='object_visibility', native_enum=False),
               existing_nullable=False,
               existing_server_default=sa.text("'public'::character varying"))
    op.alter_column('moderation_tasks', 'entity_type',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.Enum('PAGE', 'MEDIA', 'OBJECT', name='entity_type', native_enum=False),
               existing_nullable=False)
    op.alter_column('moderation_tasks', 'status',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.Enum('PENDING', 'APPROVED', 'REJECTED', name='task_status', native_enum=False),
               existing_nullable=False,
               existing_server_default=sa.text("'pending'::character varying"))
    op.alter_column('org_projects', 'status',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.Enum('ACTIVE', 'ARCHIVED', name='project_status', native_enum=False),
               existing_nullable=False,
               existing_server_default=sa.text("'active'::character varying"))
    op.alter_column('organization_invites', 'role',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.Enum('ORG_ADMIN', 'ORG_EDITOR', 'ORG_MODERATOR', 'ORG_VIEWER', name='org_role', native_enum=False),
               existing_nullable=False)
    op.alter_column('organization_invites', 'status',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.Enum('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED', name='invite_status', native_enum=False),
               existing_nullable=False,
               existing_server_default=sa.text("'pending'::character varying"))
    op.alter_column('organization_members', 'role',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.Enum('ORG_ADMIN', 'ORG_EDITOR', 'ORG_MODERATOR', 'ORG_VIEWER', name='org_role', native_enum=False),
               existing_nullable=False)
    op.alter_column('organization_members', 'status',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.Enum('INVITED', 'ACTIVE', 'REVOKED', name='member_status', native_enum=False),
               existing_nullable=False,
               existing_server_default=sa.text("'active'::character varying"))
    op.alter_column('organizations', 'type',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.Enum('GOVERNMENT', 'NGO', 'COMMERCIAL', 'OTHER', name='org_type', native_enum=False),
               existing_nullable=False,
               existing_server_default=sa.text("'other'::character varying"))
    op.alter_column('person_claim_invites', 'status',
               existing_type=sa.VARCHAR(length=20),
               type_=sa.Enum('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED', name='claim_invite_status', native_enum=False),
               existing_nullable=False,
               existing_server_default=sa.text("'pending'::character varying"))
    op.drop_constraint(op.f('uq_users_email'), 'users', type_='unique')


def downgrade() -> None:

    op.create_unique_constraint(op.f('uq_users_email'), 'users', ['email'], postgresql_nulls_not_distinct=False)
    op.alter_column('person_claim_invites', 'status',
               existing_type=sa.Enum('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED', name='claim_invite_status', native_enum=False),
               type_=sa.VARCHAR(length=20),
               existing_nullable=False,
               existing_server_default=sa.text("'pending'::character varying"))
    op.alter_column('organizations', 'type',
               existing_type=sa.Enum('GOVERNMENT', 'NGO', 'COMMERCIAL', 'OTHER', name='org_type', native_enum=False),
               type_=sa.VARCHAR(length=20),
               existing_nullable=False,
               existing_server_default=sa.text("'other'::character varying"))
    op.alter_column('organization_members', 'status',
               existing_type=sa.Enum('INVITED', 'ACTIVE', 'REVOKED', name='member_status', native_enum=False),
               type_=sa.VARCHAR(length=20),
               existing_nullable=False,
               existing_server_default=sa.text("'active'::character varying"))
    op.alter_column('organization_members', 'role',
               existing_type=sa.Enum('ORG_ADMIN', 'ORG_EDITOR', 'ORG_MODERATOR', 'ORG_VIEWER', name='org_role', native_enum=False),
               type_=sa.VARCHAR(length=20),
               existing_nullable=False)
    op.alter_column('organization_invites', 'status',
               existing_type=sa.Enum('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED', name='invite_status', native_enum=False),
               type_=sa.VARCHAR(length=20),
               existing_nullable=False,
               existing_server_default=sa.text("'pending'::character varying"))
    op.alter_column('organization_invites', 'role',
               existing_type=sa.Enum('ORG_ADMIN', 'ORG_EDITOR', 'ORG_MODERATOR', 'ORG_VIEWER', name='org_role', native_enum=False),
               type_=sa.VARCHAR(length=20),
               existing_nullable=False)
    op.alter_column('org_projects', 'status',
               existing_type=sa.Enum('ACTIVE', 'ARCHIVED', name='project_status', native_enum=False),
               type_=sa.VARCHAR(length=20),
               existing_nullable=False,
               existing_server_default=sa.text("'active'::character varying"))
    op.alter_column('moderation_tasks', 'status',
               existing_type=sa.Enum('PENDING', 'APPROVED', 'REJECTED', name='task_status', native_enum=False),
               type_=sa.VARCHAR(length=20),
               existing_nullable=False,
               existing_server_default=sa.text("'pending'::character varying"))
    op.alter_column('moderation_tasks', 'entity_type',
               existing_type=sa.Enum('PAGE', 'MEDIA', 'OBJECT', name='entity_type', native_enum=False),
               type_=sa.VARCHAR(length=20),
               existing_nullable=False)
    op.alter_column('memory_objects', 'visibility',
               existing_type=sa.Enum('PUBLIC', 'UNLISTED', 'PRIVATE', name='object_visibility', native_enum=False),
               type_=sa.VARCHAR(length=20),
               existing_nullable=False,
               existing_server_default=sa.text("'public'::character varying"))
    op.alter_column('memory_objects', 'status',
               existing_type=sa.Enum('DRAFT', 'ON_MODERATION', 'PUBLISHED', 'REJECTED', 'ARCHIVED', name='object_status', native_enum=False),
               type_=sa.VARCHAR(length=20),
               existing_nullable=False,
               existing_server_default=sa.text("'draft'::character varying"))
    op.alter_column('memory_objects', 'type',
               existing_type=sa.Enum('TREE', 'PLAQUE', 'PLACE', name='object_type', native_enum=False),
               type_=sa.VARCHAR(length=20),
               existing_nullable=False)
    op.create_unique_constraint(op.f('uq_memorial_pages_slug'), 'memorial_pages', ['slug'], postgresql_nulls_not_distinct=False)
    op.create_index(op.f('ix_memorial_pages_owner_org'), 'memorial_pages', ['owner_org_id'], unique=False)
    op.alter_column('media', 'moderation_status',
               existing_type=sa.Enum('PENDING', 'APPROVED', 'REJECTED', name='moderation_status', native_enum=False),
               type_=postgresql.ENUM('pending', 'approved', 'rejected', name='moderation_status'),
               existing_nullable=False,
               existing_server_default=sa.text("'pending'::moderation_status"))
    op.alter_column('media', 'type',
               existing_type=sa.Enum('IMAGE', 'VIDEO', name='media_type', native_enum=False),
               type_=postgresql.ENUM('image', 'video', name='media_type'),
               existing_nullable=False)
    op.drop_column('media', 'is_primary')
    op.alter_column('family_relationships', 'status',
               existing_type=sa.Enum('PENDING', 'ACTIVE', 'REJECTED', name='relationship_status', native_enum=False),
               type_=sa.VARCHAR(length=20),
               existing_nullable=False,
               existing_server_default=sa.text("'pending'::character varying"))
    op.alter_column('family_relationships', 'relation_type',
               existing_type=sa.Enum('MOTHER', 'FATHER', 'BROTHER', 'SISTER', 'SPOUSE', 'SON', 'DAUGHTER', 'CHILD', 'PARENT', 'SIBLING', name='relation_type', native_enum=False),
               type_=sa.VARCHAR(length=50),
               existing_nullable=False)

