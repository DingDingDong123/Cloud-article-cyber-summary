import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Request, HTTPException, Depends

cred = credentials.Certificate("firebase_admin.json")
firebase_admin.initialize_app(cred)

async def get_current_user(request: Request):
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        id_token = token.split(" ")[1]
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
