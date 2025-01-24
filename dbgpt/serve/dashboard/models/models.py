"""This is an auto-generated model file
You can define your own models and DAOs here
"""
from datetime import datetime
from typing import Any, Dict, Union

from sqlalchemy import Column, DateTime, Index, Integer, String, Text

from dbgpt.storage.metadata import BaseDao, Model, db

from ..api.schemas import ServeRequest, ServerResponse
from ..config import ServeConfig


class ServeEntity(Model):
    __tablename__ = "dashboard"
    id = Column(Integer, primary_key=True)
    name = Column(String(128))
    description = Column(String(128))
    content = Column(Text)
    user_id = Column(Integer, nullable=True, comment="User ID")
    gmt_created = Column(DateTime, default=datetime.utcnow, comment="Creation time")
    gmt_modified = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        comment="Modification time",
    )

    __table_args__ = (
        Index("idx_dashboard_user_id", "user_id"),
    )

    def __repr__(self):
        return (
            f"DashboardEntity(id={self.id}, name='{self.name}', description='{self.description}', "
            f"content='{self.content}', user_id='{self.user_id}', gmt_created='{self.gmt_created}', gmt_modified='{self.gmt_modified}')"
        )


class ServeDao(BaseDao[ServeEntity, ServeRequest, ServerResponse]):
    """The DAO class for Dashboard"""

    def __init__(self, serve_config: ServeConfig):
        super().__init__()
        self._serve_config = serve_config

    def from_request(self, request: Union[ServeRequest, Dict[str, Any]]) -> ServeEntity:
        """Convert the request to an entity

        Args:
            request (Union[ServeRequest, Dict[str, Any]]): The request

        Returns:
            T: The entity
        """
        new_dict = {
            "id": request.id,
            "name": request.name,
            "description": request.description,
            "content": request.content,
            "user_id": request.user_id
        }
        entity = ServeEntity(**new_dict)
        return entity

    def to_request(self, entity: ServeEntity) -> ServeRequest:
        """Convert the entity to a request

        Args:
            entity (T): The entity

        Returns:
            REQ: The request
        """
       
        gmt_created_str = (
            entity.gmt_created.strftime("%Y-%m-%d %H:%M:%S")
            if entity.gmt_created
            else None
        )
        gmt_modified_str = (
            entity.gmt_modified.strftime("%Y-%m-%d %H:%M:%S")
            if entity.gmt_modified
            else None
        )
        return ServeRequest(
            **{
                "id": entity.id,
                "name": entity.name,
                "description": entity.description,
                "content": entity.content,
                "user_id": entity.user_id,
                "gmt_created": gmt_created_str,
                "gmt_modified": gmt_modified_str,
            }
        )

    def to_response(self, entity: ServeEntity) -> ServerResponse:
        """Convert the entity to a response

        Args:
            entity (T): The entity

        Returns:
            RES: The response
        """

        return self.to_request(entity)
