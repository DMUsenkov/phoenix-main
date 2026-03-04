import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient


class TestHealthEndpoint:
    """Tests for /health endpoint."""

    def test_health_returns_ok(self, client: TestClient) -> None:
        """Health endpoint should return status ok."""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "version" in data

    def test_health_returns_version(self, client: TestClient) -> None:
        """Health endpoint should return app version."""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["version"] == "0.1.0"

    @pytest.mark.asyncio
    async def test_health_async(self, async_client: AsyncClient) -> None:
        """Health endpoint should work with async client."""
        response = await async_client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


class TestOpenAPI:
    """Tests for OpenAPI documentation."""

    def test_openapi_available(self, client: TestClient) -> None:
        """OpenAPI schema should be available."""
        response = client.get("/openapi.json")

        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert data["info"]["title"] == "Phoenix API"
