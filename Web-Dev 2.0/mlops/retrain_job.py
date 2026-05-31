import os
import logging
from datetime import datetime
from dotenv import load_dotenv
from apscheduler.schedulers.blocking import BlockingScheduler
from supabase import create_client, Client


# Import our custom ML modules
from data_loader import fetch_graph_data, update_database_embeddings
from gnn_model import DealMatchGNN

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Fail fast if the .env file didn't load properly
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("CRITICAL: Supabase credentials missing. Check your .env file!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
# Configure Enterprise-Grade Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.FileHandler("mlops_retrain.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("MLOps-Engine")

def execute_gnn_retraining():
    """The core MLOps execution function."""
    logger.info("INITIATING CONTINUOUS MLOPS RETRAINING CYCLE")
    start_time = datetime.now()

    try:
        # 1. Ingest Latest Data & Convert to PyTorch Tensors
        x, edge_index, index_to_id = fetch_graph_data()
        
        if x is None or len(x) == 0:
            logger.warning("No data found in Supabase. Aborting training cycle.")
            return

        # 2. Initialize the GraphSAGE Neural Network
        logger.info("Initializing GraphSAGE Model architecture...")
        model = DealMatchGNN(in_channels=384, hidden_channels=256, out_channels=384)
        
        # Set model to training mode (enables dropout)
        model.train()

        # 3. Execute Graph Propagation
        logger.info("Propagating vector math through the network topology...")
        # In a real environment, you'd calculate loss and backpropagate here.
        # For now, we are doing a forward pass to let nodes learn from their neighbors.
        new_embeddings = model(x, edge_index)

        # 4. Save & Push to Database
        logger.info("Extracting updated 384-dimensional embeddings...")
        update_database_embeddings(index_to_id, new_embeddings)

        duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"MLOPS CYCLE SUCCESSFUL. Duration: {duration:.2f} seconds.")

    except Exception as e:
        logger.error(f"CRITICAL MLOPS FAILURE: {str(e)}", exc_info=True)

if __name__ == "__main__":
    logger.info("Starting MLOps Background Daemon...")
    
    scheduler = BlockingScheduler()
    
    # Run every 1 minute for local testing
    #scheduler.add_job(execute_gnn_retraining, 'interval', minutes=1, max_instances=1) # Prevents overlapping jobs
    # Schedule the job to run every day at 3:00 AM
    scheduler.add_job(
        execute_gnn_retraining, 
        'cron', 
        hour=3, 
        minute=0, 
        misfire_grace_time=3600 # If the server is down at 3AM, run it when it boots up
    )
    
    logger.info("Scheduler armed. Retraining set for 1-minute intervals.")
    
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("MLOps Daemon shut down gracefully.")