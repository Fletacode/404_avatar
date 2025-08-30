import logging
import os

from dotenv import load_dotenv
from PIL import Image

from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, WorkerType, cli
from livekit.plugins import hedra, openai

logger = logging.getLogger("hedra-avatar-example")
logger.setLevel(logging.INFO)

load_dotenv(".env.local")


async def entrypoint(ctx: JobContext):
    logger.info(f"Agent starting for room: {ctx.room.name}")
    
    session = AgentSession(
        # List of voices here: https://www.openai.fm/
        llm=openai.realtime.RealtimeModel(voice="ash"),
    )

    # Get user information from room participants
    user_avatar = await get_user_avatar(ctx.room)
    logger.info(f"Selected avatar image: {os.path.basename(user_avatar.filename) if hasattr(user_avatar, 'filename') else 'Unknown'}")
    
    # Create avatar session with user-specific image
    hedra_avatar = hedra.AvatarSession(avatar_image=user_avatar)
    await hedra_avatar.start(session, room=ctx.room)
    logger.info("Hedra avatar session started successfully")

    await session.start(
        agent=Agent(instructions="Talk to me!"),
        room=ctx.room,
    )
    logger.info("Agent session started successfully")

    session.generate_reply(instructions="say hello to the user")


async def get_user_avatar(room) -> Image.Image:
    """
    Get the appropriate avatar image based on the user in the room.
    Returns a default avatar if no specific user is found.
    """
    try:
        logger.info(f"Getting user avatar for room: {room.name}")
        
        # Wait a bit for participants to be available
        import asyncio
        await asyncio.sleep(0.5)
        
        # Get all remote participants in the room
        remote_participants = room.local_participant
        logger.info(f"Found {len(remote_participants)} remote participants")
        
        # Look for human participants (non-agent)
        for participant_sid, participant in remote_participants.items():
            logger.info(f"Checking participant: {participant.identity}")
            
            if participant.identity and not participant.identity.startswith("agent"):
                # Parse username from identity (format: username_userId)
                if "_" in participant.identity:
                    username = participant.identity.split("_")[0].lower()
                    logger.info(f"Extracted username: {username}")
                    
                    # Map username to avatar image
                    avatar_path = get_avatar_path_by_username(username)
                    if avatar_path and os.path.exists(avatar_path):
                        logger.info(f"Using avatar for user: {username} at path: {avatar_path}")
                        return Image.open(avatar_path)
                    else:
                        logger.info(f"Avatar not found for user: {username}, using default")
                        break
                else:
                    logger.info(f"User identity format not recognized: {participant.identity}, using default avatar")
                    break
        
        # If no remote participants found, try local participant
        if hasattr(room, 'local_participant') and room.local_participant:
            logger.info(f"Checking local participant: {room.local_participant.identity}")
        
        # Default avatar if no specific user avatar found
        default_avatar_path = os.path.join(os.path.dirname(__file__), "assets/fred.png")
        logger.info("Using default avatar: fred.png")
        return Image.open(default_avatar_path)
        
    except Exception as e:
        logger.error(f"Error getting user avatar: {e}")
        # Fallback to default avatar
        default_avatar_path = os.path.join(os.path.dirname(__file__), "assets/fred.png")
        return Image.open(default_avatar_path)


def get_avatar_path_by_username(username: str) -> str:
    """
    Map username to avatar image path.
    Returns the path to the avatar image or None if not found.
    """
    assets_dir = os.path.join(os.path.dirname(__file__), "assets")
    
    # Define username to avatar mapping
    avatar_mapping = {
        "fred": os.path.join(assets_dir, "fred.png"),
        "mary": os.path.join(assets_dir, "mary.png"),
        # Add more mappings as needed
        # "john": os.path.join(assets_dir, "john.png"),
    }
    
    # First try exact match
    if username in avatar_mapping:
        return avatar_mapping[username]
    
    # If no exact match, try to find a similar avatar
    # This allows for more flexible matching
    for key in avatar_mapping.keys():
        if key in username or username in key:
            logger.info(f"Using similar avatar '{key}' for username '{username}'")
            return avatar_mapping[key]
    
    # Return None if no match found
    return None


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, worker_type=WorkerType.ROOM))
