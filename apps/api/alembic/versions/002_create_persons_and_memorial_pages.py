"""Create persons and memorial_pages tables

Revision ID: 002
Revises: 001
Create Date: 2026-01-25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.create_table(
        "persons",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column(
            "gender",
            sa.Enum("male", "female", "other", "unknown", name="gender"),
            nullable=False,
            server_default="unknown",
        ),
        sa.Column(
            "life_status",
            sa.Enum("alive", "deceased", "unknown", name="life_status"),
            nullable=False,
            server_default="unknown",
        ),
        sa.Column("birth_date", sa.Date(), nullable=True),
        sa.Column("death_date", sa.Date(), nullable=True),
        sa.Column("created_by_user_id", sa.UUID(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_persons")),
        sa.ForeignKeyConstraint(
            ["created_by_user_id"],
            ["users.id"],
            name=op.f("fk_persons_created_by_user_id_users"),
            ondelete="SET NULL",
        ),
    )


    op.create_index("ix_persons_full_name", "persons", ["full_name"], unique=False)
    op.create_index("ix_persons_life_status", "persons", ["life_status"], unique=False)


    op.create_table(
        "memorial_pages",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("person_id", sa.UUID(), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("biography", sa.Text(), nullable=True),
        sa.Column(
            "visibility",
            sa.Enum("public", "unlisted", "private", name="page_visibility"),
            nullable=False,
            server_default="public",
        ),
        sa.Column(
            "status",
            sa.Enum("draft", "on_moderation", "published", "rejected", "archived", name="page_status"),
            nullable=False,
            server_default="draft",
        ),
        sa.Column("owner_user_id", sa.UUID(), nullable=True),
        sa.Column("created_by_user_id", sa.UUID(), nullable=True),
        sa.Column("published_at", sa.DateTime(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_memorial_pages")),
        sa.ForeignKeyConstraint(
            ["person_id"],
            ["persons.id"],
            name=op.f("fk_memorial_pages_person_id_persons"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["owner_user_id"],
            ["users.id"],
            name=op.f("fk_memorial_pages_owner_user_id_users"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["created_by_user_id"],
            ["users.id"],
            name=op.f("fk_memorial_pages_created_by_user_id_users"),
            ondelete="SET NULL",
        ),
        sa.UniqueConstraint("person_id", name=op.f("uq_memorial_pages_person_id")),
        sa.UniqueConstraint("slug", name=op.f("uq_memorial_pages_slug")),
    )


    op.create_index("ix_memorial_pages_slug", "memorial_pages", ["slug"], unique=True)
    op.create_index("ix_memorial_pages_status", "memorial_pages", ["status"], unique=False)
    op.create_index(
        "ix_memorial_pages_owner_status",
        "memorial_pages",
        ["owner_user_id", "status"],
        unique=False,
    )


def downgrade() -> None:

    op.drop_index("ix_memorial_pages_owner_status", table_name="memorial_pages")
    op.drop_index("ix_memorial_pages_status", table_name="memorial_pages")
    op.drop_index("ix_memorial_pages_slug", table_name="memorial_pages")


    op.drop_table("memorial_pages")


    op.drop_index("ix_persons_life_status", table_name="persons")
    op.drop_index("ix_persons_full_name", table_name="persons")


    op.drop_table("persons")


    sa.Enum(name="page_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="page_visibility").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="life_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="gender").drop(op.get_bind(), checkfirst=True)
