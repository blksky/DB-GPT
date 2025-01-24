# Define your Pydantic schemas here
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from dbgpt._private.pydantic import BaseModel, ConfigDict, Field, model_to_dict


class ServeRequest(BaseModel):
    """Dashboard request model"""

    id: Optional[int] = Field(None, description="Primary Key")
    gmt_created: Optional[str] = Field(None, description="Creation time")
    gmt_modified: Optional[str] = Field(None, description="Modification time")
    name: Optional[str] = Field(None, description="报表名称")
    description: Optional[str] = Field(None, description="报表描述")
    content: Optional[str] = Field(None, description="报表详细内容")
    user_id: Optional[int] = Field(None, description="User ID")


    def to_dict(self) -> Dict[str, Any]:
        """Convert to dict."""
        return model_to_dict(self)


ServerResponse = ServeRequest
