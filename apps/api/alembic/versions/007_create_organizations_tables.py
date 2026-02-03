"""Create organizations tables and add org ownership.

Revision ID: 007
Revises: 006
Create Date: 2026-01-25

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "organizations",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("type", sa.String(20), nullable=False, server_default="other"),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column(
            "created_by_user_id",
            sa.UUID(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_organizations_created_by", "organizations", ["created_by_user_id"])

    op.create_table(
        "organization_members",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column(
            "org_id",
            sa.UUID(),
            sa.ForeignKey("organizations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.UUID(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("org_id", "user_id", name="uq_org_member"),
    )
    op.create_index("ix_org_members_org_role", "organization_members", ["org_id", "role"])
    op.create_index("ix_org_members_user", "organization_members", ["user_id"])

    op.create_table(
        "organization_invites",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column(
            "org_id",
            sa.UUID(),
            sa.ForeignKey("organizations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("token", sa.String(64), unique=True, nullable=False, index=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column(
            "created_by_user_id",
            sa.UUID(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_org_invites_org_email", "organization_invites", ["org_id", "email"])
    op.create_index("ix_org_invites_status", "organization_invites", ["status"])

    op.create_table(
        "org_projects",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column(
            "org_id",
            sa.UUID(),
            sa.ForeignKey("organizations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_org_projects_org_status", "org_projects", ["org_id", "status"])

    op.add_column(
        "memorial_pages",
        sa.Column(
            "owner_org_id",
            sa.UUID(),
            sa.ForeignKey("organizations.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index("ix_memorial_pages_owner_org", "memorial_pages", ["owner_org_id"])

    op.add_column(
        "memory_objects",
        sa.Column(
            "owner_org_id",
            sa.UUID(),
            sa.ForeignKey("organizations.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.add_column(
        "memory_objects",
        sa.Column(
            "org_project_id",
            sa.UUID(),
            sa.ForeignKey("org_projects.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index("ix_memory_objects_owner_org", "memory_objects", ["owner_org_id"])
    op.create_index("ix_memory_objects_project", "memory_objects", ["org_project_id"])


def downgrade() -> None:
    op.drop_index("ix_memory_objects_project", table_name="memory_objects")
    op.drop_index("ix_memory_objects_owner_org", table_name="memory_objects")
    op.drop_column("memory_objects", "org_project_id")
    op.drop_column("memory_objects", "owner_org_id")

    op.drop_index("ix_memorial_pages_owner_org", table_name="memorial_pages")
    op.drop_column("memorial_pages", "owner_org_id")

    op.drop_index("ix_org_projects_org_status", table_name="org_projects")
    op.drop_table("org_projects")

    op.drop_index("ix_org_invites_status", table_name="organization_invites")
    op.drop_index("ix_org_invites_org_email", table_name="organization_invites")
    op.drop_table("organization_invites")

    op.drop_index("ix_org_members_user", table_name="organization_members")
    op.drop_index("ix_org_members_org_role", table_name="organization_members")
    op.drop_table("organization_members")

    op.drop_index("ix_organizations_created_by", table_name="organizations")
    op.drop_table("organizations")
