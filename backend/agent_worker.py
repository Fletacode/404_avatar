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


async def entrypoint(ctx: JobContext):
    logger.info(f"Agent starting for room: {ctx.room.name}")
    
    CUSTOM_IMAGE_PATH, CUSTOM_PROMPT, USER_ID, USERNAME = load_config_from_file()

    # Configuration already loaded at startup, just use it
    logger.info(f"Using loaded configuration:")
    logger.info(f"  Image path: {CUSTOM_IMAGE_PATH}")
    logger.info(f"  Prompt: {CUSTOM_PROMPT}")
    logger.info(f"  User ID: {USER_ID}")
    logger.info(f"  Username: {USERNAME}")
    
    # Use custom prompt if provided, otherwise use default
    agent_instructions = CUSTOM_PROMPT if CUSTOM_PROMPT else "Talk to me!"
    logger.info(f"Using agent instructions: {agent_instructions}")
    
    session = AgentSession(
        # List of voices here: https://www.openai.fm/
        llm=openai.realtime.RealtimeModel(voice="ash"),
    )

    # Get user avatar (custom or default)
    user_avatar = await get_user_avatar(ctx.room, CUSTOM_IMAGE_PATH)
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


async def get_user_avatar(room, CUSTOM_IMAGE_PATH) -> Image.Image:
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
        
        # Default avatar if no specific user avatar found
        default_avatar_path = os.path.join(os.path.dirname(__file__), "assets/fred.png")
        logger.info("Using default avatar: fred.png")
        return Image.open(default_avatar_path)
        
    except Exception as e:
        logger.error(f"Error getting user avatar: {e}")
        # Fallback to default avatar
        default_avatar_path = os.path.join(os.path.dirname(__file__), "assets/fred.png")
        return Image.open(default_avatar_path)



def load_config_from_file():
    """Load configuration from config file"""
    
    
    config_file_path = os.path.join(os.path.dirname(__file__), "assets", "agent_config.txt")
    
    logger.info(f"Loading configuration from file: {config_file_path}")
    
    try:
        if os.path.exists(config_file_path):
            with open(config_file_path, 'r', encoding='utf-8') as f:
                config_lines = f.readlines()
            
            for line in config_lines:
                line = line.strip()
                if line and '=' in line:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip()
                    
                    if key == 'IMAGE_PATH':
                        CUSTOM_IMAGE_PATH = os.path.join(os.path.dirname(__file__), "assets", value)
                        logger.info(f"Config file - Image path: {CUSTOM_IMAGE_PATH}")
                    elif key == 'PROMPT':
                        CUSTOM_PROMPT = value
                        logger.info(f"Config file - Prompt: {CUSTOM_PROMPT}")
                    elif key == 'USER_ID':
                        USER_ID = value
                        logger.info(f"Config file - User ID: {USER_ID}")
                    elif key == 'USERNAME':
                        USERNAME = value
                        logger.info(f"Config file - Username: {USERNAME}")
            
            logger.info(f"Configuration loaded from file successfully")
            
            if CUSTOM_IMAGE_PATH:
                # 이미지 파일 존재 확인
                if os.path.exists(CUSTOM_IMAGE_PATH):
                    logger.info(f"✓ Custom image file exists: {CUSTOM_IMAGE_PATH}")
                else:
                    logger.error(f"✗ Custom image file NOT found: {CUSTOM_IMAGE_PATH}")
            else:
                logger.info("No custom image path provided, will use default avatar selection")
                
        else:
            logger.info("Config file not found, using default configuration")
        
        return CUSTOM_IMAGE_PATH, CUSTOM_PROMPT, USER_ID, USERNAME
            
    except Exception as e:
        logger.error(f"Error loading config file: {e}")
        logger.info("Falling back to default configuration")

if __name__ == "__main__":
    logger.info("Starting LiveKit Agent Worker...")
    
    # 에이전트 시작 시점에 설정 파일 로드
    
    
    logger.info("Configuration loaded, starting agent...")
    
    # Run the agent
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, worker_type=WorkerType.ROOM))
