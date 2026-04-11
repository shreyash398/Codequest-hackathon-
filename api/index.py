from app import app

# Vercel needs the app object to be imported for serverless execution.
# This file serves as the entry point for the @vercel/python builder.
app = app
