from dataclasses import dataclass


@dataclass(frozen=True)
class Language:
    code: str
    name: str
    native_name: str = ""
    family: str = ""
    region: str = ""
    country: str = ""
    status: str = "planned"
    dialect_info: str = ""
    script: str = ""
    notes: str = ""

    def as_dict(self) -> dict:
        return {
            "code": self.code,
            "name": self.name,
            "native_name": self.native_name,
            "family": self.family,
            "region": self.region,
            "country": self.country,
            "status": self.status,
            "dialect_info": self.dialect_info,
            "script": self.script,
            "notes": self.notes,
        }
