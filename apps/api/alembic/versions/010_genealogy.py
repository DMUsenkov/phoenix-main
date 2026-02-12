"""Genealogy - family relationships, claims, linked_user_id

Revision ID: 010_genealogy
Revises: 009_moderation_platform
Create Date: 2026-01-25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '010_genealogy'
down_revision: Union[str, None] = '009_moderation_platform'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column('persons', sa.Column('linked_user_id', sa.UUID(), nullable=True))
    op.create_foreign_key(
        'fk_persons_linked_user_id',
        'persons', 'users',
        ['linked_user_id'], ['id'],
        ondelete='SET NULL'
    )
    op.create_index('ix_persons_linked_user_id', 'persons', ['linked_user_id'], unique=True)


    op.create_table(
        'family_relationships',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('from_person_id', sa.UUID(), nullable=False),
        sa.Column('to_person_id', sa.UUID(), nullable=False),
        sa.Column('relation_type', sa.String(50), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('requested_by_user_id', sa.UUID(), nullable=True),
        sa.Column('requested_to_user_id', sa.UUID(), nullable=True),
        sa.Column('decided_by_user_id', sa.UUID(), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('inverse_relationship_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('decided_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['from_person_id'], ['persons.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['to_person_id'], ['persons.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['requested_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['requested_to_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['decided_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['inverse_relationship_id'], ['family_relationships.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('from_person_id', 'to_person_id', 'relation_type', name='uq_family_relationship'),
        sa.CheckConstraint('from_person_id != to_person_id', name='ck_no_self_edge'),
    )

    op.create_index('ix_family_relationships_from', 'family_relationships', ['from_person_id'])
    op.create_index('ix_family_relationships_to', 'family_relationships', ['to_person_id'])
    op.create_index('ix_family_relationships_status', 'family_relationships', ['status'])
    op.create_index('ix_family_relationships_requested_to', 'family_relationships', ['requested_to_user_id', 'status'])


    op.create_table(
        'person_claim_invites',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('person_id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('token', sa.String(64), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_by_user_id', sa.UUID(), nullable=True),
        sa.Column('accepted_by_user_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('accepted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['person_id'], ['persons.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['accepted_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_index('ix_person_claim_invites_token', 'person_claim_invites', ['token'], unique=True)
    op.create_index('ix_person_claim_invites_person', 'person_claim_invites', ['person_id'])
    op.create_index('ix_person_claim_invites_email', 'person_claim_invites', ['email'])
    op.create_index('ix_person_claim_invites_status', 'person_claim_invites', ['status'])


def downgrade() -> None:
    op.drop_table('person_claim_invites')
    op.drop_table('family_relationships')

    op.drop_index('ix_persons_linked_user_id', 'persons')
    op.drop_constraint('fk_persons_linked_user_id', 'persons', type_='foreignkey')
    op.drop_column('persons', 'linked_user_id')
