import logging
import os

from dotenv import load_dotenv
from PIL import Image

from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, WorkerType, cli
from livekit.plugins import hedra, openai

logger = logging.getLogger("hedra-avatar-example")
logger.setLevel(logging.INFO)

# 로그 파일 설정
log_file = os.path.join(os.path.dirname(__file__), "agent_worker.log")
file_handler = logging.FileHandler(log_file)
console_handler = logging.StreamHandler()

# 로그 포맷 설정
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

logger.addHandler(file_handler)
logger.addHandler(console_handler)

load_dotenv(".env.local")

# Global variables to store command line arguments
CUSTOM_IMAGE_PATH = None
CUSTOM_PROMPT = None
USER_ID = None
USERNAME = None


async def entrypoint(ctx: JobContext):
    logger.info(f"Agent starting for room: {ctx.room.name}")
    
    # Load configuration from environment variables at the start of entrypoint
    load_config_from_env()
    
    # Use custom prompt if provided, otherwise use default
    agent_instructions = CUSTOM_PROMPT if CUSTOM_PROMPT else "Talk to me!"
    logger.info(f"Using agent instructions: {agent_instructions}")
    
    session = AgentSession(
        # List of voices here: https://www.openai.fm/
        llm=openai.realtime.RealtimeModel(voice="ash"),
    )

    # Get user avatar (custom or default)
    user_avatar = await get_user_avatar(ctx.room)
    logger.info(f"Selected avatar image: {os.path.basename(user_avatar.filename) if hasattr(user_avatar, 'filename') else 'Unknown'}")
    
    # Create avatar session with user-specific image
    hedra_avatar = hedra.AvatarSession(avatar_image=user_avatar)
    await hedra_avatar.start(session, room=ctx.room)
    logger.info("Hedra avatar session started successfully")

    await session.start(
        agent=Agent(instructions=agent_instructions),
        room=ctx.room,
    )
    logger.info("Agent session started successfully")

    session.generate_reply(instructions="say hello to the user")


async def get_user_avatar(room) -> Image.Image:
    """
    Get the appropriate avatar image based on the user in the room.
    Returns a custom image if provided via command line, otherwise uses default logic.
    """
    try:
        logger.info(f"get_user_avatar called - CUSTOM_IMAGE_PATH: {CUSTOM_IMAGE_PATH}")
        
        # If custom image path is provided via environment variable, use it
        if CUSTOM_IMAGE_PATH and os.path.exists(CUSTOM_IMAGE_PATH):
            logger.info(f"✓ Using custom avatar image: {CUSTOM_IMAGE_PATH}")
            try:
                image = Image.open(CUSTOM_IMAGE_PATH)
                logger.info(f"✓ Successfully loaded custom image: {image.size} pixels, mode: {image.mode}")
                return image
            except Exception as e:
                logger.error(f"✗ Failed to load custom image: {e}")
                # Fall through to default logic
        elif CUSTOM_IMAGE_PATH:
            logger.error(f"✗ Custom image path provided but file does not exist: {CUSTOM_IMAGE_PATH}")
        else:
            logger.info("No custom image path provided, proceeding with default avatar logic")
        
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


def load_config_from_env():
    """Load configuration from environment variables"""
    global CUSTOM_IMAGE_PATH, CUSTOM_PROMPT, USER_ID, USERNAME
    
    logger.info("Loading configuration from environment variables...")
    
    CUSTOM_IMAGE_PATH = os.environ.get('AGENT_IMAGE_PATH')
    CUSTOM_PROMPT = os.environ.get('AGENT_PROMPT')
    USER_ID = os.environ.get('AGENT_USER_ID')
    USERNAME = os.environ.get('AGENT_USERNAME')
    
    logger.info(f"Environment variables loaded:")
    logger.info(f"  AGENT_IMAGE_PATH: {CUSTOM_IMAGE_PATH}")
    logger.info(f"  AGENT_PROMPT: {CUSTOM_PROMPT}")
    logger.info(f"  AGENT_USER_ID: {USER_ID}")
    logger.info(f"  AGENT_USERNAME: {USERNAME}")
    
    if CUSTOM_IMAGE_PATH:
        # 이미지 파일 존재 확인
        if os.path.exists(CUSTOM_IMAGE_PATH):
            logger.info(f"✓ Custom image file exists: {CUSTOM_IMAGE_PATH}")
        else:
            logger.error(f"✗ Custom image file NOT found: {CUSTOM_IMAGE_PATH}")
    else:
        logger.info("No custom image path provided, will use default avatar selection")

if __name__ == "__main__":
    logger.info("Starting LiveKit Agent Worker...")
    logger.info("Configuration will be loaded when agent connects to room")
    
    # Run the agent
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, worker_type=WorkerType.ROOM))
