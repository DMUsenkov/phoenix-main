"""Extended page model - all new fields and tables for memorial pages.

Revision ID: 014_extended_page_model
Revises: 0f0780efffd1
Create Date: 2026-01-26

Adds:
- Person: birth_place, death_place, burial_place (with lat/lng), burial_photo_url
- MemorialPage: short_description, biography_json (Rich Text)
- life_events table
- achievements table
- education table
- career table
- person_values table (values, beliefs, principles)
- quotes table
- memorial_messages table (guestbook)
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "014_extended_page_model"
down_revision = "013"
branch_labels = None
depends_on = None


def upgrade() -> None:

    op.add_column("persons", sa.Column("birth_place", sa.String(512), nullable=True))
    op.add_column("persons", sa.Column("birth_place_lat", sa.Float(), nullable=True))
    op.add_column("persons", sa.Column("birth_place_lng", sa.Float(), nullable=True))

    op.add_column("persons", sa.Column("death_place", sa.String(512), nullable=True))
    op.add_column("persons", sa.Column("death_place_lat", sa.Float(), nullable=True))
    op.add_column("persons", sa.Column("death_place_lng", sa.Float(), nullable=True))

    op.add_column("persons", sa.Column("burial_place", sa.String(512), nullable=True))
    op.add_column("persons", sa.Column("burial_place_lat", sa.Float(), nullable=True))
    op.add_column("persons", sa.Column("burial_place_lng", sa.Float(), nullable=True))
    op.add_column("persons", sa.Column("burial_photo_url", sa.String(1024), nullable=True))


    op.add_column("memorial_pages", sa.Column("short_description", sa.String(500), nullable=True))
    op.add_column("memorial_pages", sa.Column("biography_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True))


    op.create_table(
        "life_events",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("page_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("location", sa.String(512), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["page_id"], ["memorial_pages.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_life_events_page_id", "life_events", ["page_id", "sort_order"])


    op.create_table(
        "achievements",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("page_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("date", sa.Date(), nullable=True),
        sa.Column("category", sa.String(50), nullable=True),
        sa.Column("custom_category", sa.String(100), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["page_id"], ["memorial_pages.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_achievements_page_id", "achievements", ["page_id", "sort_order"])


    op.create_table(
        "education",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("page_id", sa.UUID(), nullable=False),
        sa.Column("institution", sa.String(255), nullable=False),
        sa.Column("degree", sa.String(255), nullable=True),
        sa.Column("field_of_study", sa.String(255), nullable=True),
        sa.Column("start_year", sa.Integer(), nullable=True),
        sa.Column("end_year", sa.Integer(), nullable=True),
        sa.Column("description", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["page_id"], ["memorial_pages.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_education_page_id", "education", ["page_id", "sort_order"])


    op.create_table(
        "career",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("page_id", sa.UUID(), nullable=False),
        sa.Column("organization", sa.String(255), nullable=False),
        sa.Column("role", sa.String(255), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("description", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["page_id"], ["memorial_pages.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_career_page_id", "career", ["page_id", "sort_order"])


    op.create_table(
        "person_values",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("page_id", sa.UUID(), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("text", sa.String(500), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["page_id"], ["memorial_pages.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_person_values_page_id", "person_values", ["page_id", "type", "sort_order"])


    op.create_table(
        "quotes",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("page_id", sa.UUID(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("source", sa.String(255), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["page_id"], ["memorial_pages.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_quotes_page_id", "quotes", ["page_id", "sort_order"])


    op.create_table(
        "memorial_messages",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("page_id", sa.UUID(), nullable=False),
        sa.Column("author_name", sa.String(255), nullable=False),
        sa.Column("author_user_id", sa.UUID(), nullable=True),
        sa.Column("text", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("approved_by_user_id", sa.UUID(), nullable=True),
        sa.Column("approved_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["page_id"], ["memorial_pages.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["author_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["approved_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_memorial_messages_page_id", "memorial_messages", ["page_id", "is_approved", "created_at"])


def downgrade() -> None:

    op.drop_table("memorial_messages")
    op.drop_table("quotes")
    op.drop_table("person_values")
    op.drop_table("career")
    op.drop_table("education")
    op.drop_table("achievements")
    op.drop_table("life_events")


    op.execute("DROP TYPE IF EXISTS value_type")
    op.execute("DROP TYPE IF EXISTS achievement_category")


    op.drop_column("memorial_pages", "biography_json")
    op.drop_column("memorial_pages", "short_description")


    op.drop_column("persons", "burial_photo_url")
    op.drop_column("persons", "burial_place_lng")
    op.drop_column("persons", "burial_place_lat")
    op.drop_column("persons", "burial_place")
    op.drop_column("persons", "death_place_lng")
    op.drop_column("persons", "death_place_lat")
    op.drop_column("persons", "death_place")
    op.drop_column("persons", "birth_place_lng")
    op.drop_column("persons", "birth_place_lat")
    op.drop_column("persons", "birth_place")
