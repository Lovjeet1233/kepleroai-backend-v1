import axios from 'axios';
import FormData from 'form-data';
import { AppError } from '../middleware/error.middleware';

const PYTHON_RAG_BASE_URL = process.env.RAG_API_URL || 'http://localhost:8000';

/**
 * Python RAG Service
 * Integrates with Python RAG backend running on port 8000
 */
export class PythonRagService {
  /**
   * Create a new collection in the RAG system
   */
  async createCollection(collectionName: string): Promise<any> {
    try {
      console.log(`[Python RAG] Creating collection: ${collectionName}`);
      
      const response = await axios.post(`${PYTHON_RAG_BASE_URL}/rag/create_collection`, {
        collection_name: collectionName
      });

      console.log(`[Python RAG] Collection created successfully: ${collectionName}`);
      return response.data;
    } catch (error: any) {
      console.error('[Python RAG] Failed to create collection:', error.response?.data || error.message);
      throw new AppError(
        500,
        'RAG_COLLECTION_ERROR',
        `Failed to create RAG collection: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  /**
   * Ingest data into a collection
   * Supports URLs, PDFs, and Excel files
   */
  async ingestData(params: {
    collectionName: string;
    urlLinks?: string[];
    pdfFiles?: Buffer[];
    excelFiles?: Buffer[];
  }): Promise<any> {
    try {
      console.log(`[Python RAG] Ingesting data into collection: ${params.collectionName}`);
      
      const formData = new FormData();
      formData.append('collection_name', params.collectionName);

      // Add URL links as comma-separated string
      if (params.urlLinks && params.urlLinks.length > 0) {
        formData.append('url_links', params.urlLinks.join(','));
      }

      // Add PDF files
      if (params.pdfFiles && params.pdfFiles.length > 0) {
        params.pdfFiles.forEach((fileBuffer, index) => {
          formData.append('pdf_files', fileBuffer, `file_${index}.pdf`);
        });
      }

      // Add Excel files
      if (params.excelFiles && params.excelFiles.length > 0) {
        params.excelFiles.forEach((fileBuffer, index) => {
          formData.append('excel_files', fileBuffer, `file_${index}.xlsx`);
        });
      }

      const response = await axios.post(
        `${PYTHON_RAG_BASE_URL}/rag/data_ingestion`,
        formData,
        {
          headers: {
            ...formData.getHeaders()
          }
        }
      );

      console.log(`[Python RAG] Data ingestion completed for: ${params.collectionName}`);
      return response.data;
    } catch (error: any) {
      console.error('[Python RAG] Failed to ingest data:', error.response?.data || error.message);
      throw new AppError(
        500,
        'RAG_INGESTION_ERROR',
        `Failed to ingest data: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  /**
   * Chat with RAG system
   * Uses LangGraph workflow with retrieval and generation
   */
  async chat(params: {
    query: string;
    collectionName: string;
    topK?: number;
    threadId?: string;
    systemPrompt?: string;
  }): Promise<{
    query: string;
    answer: string;
    retrieved_docs: string[];
    context: string;
    thread_id: string;
  }> {
    try {
      console.log(`[Python RAG] Chat query in collection: ${params.collectionName}`);
      
      const response = await axios.post(`${PYTHON_RAG_BASE_URL}/rag/chat`, {
        query: params.query,
        collection_name: params.collectionName,
        top_k: params.topK || 5,
        thread_id: params.threadId,
        system_prompt: params.systemPrompt
      });

      console.log(`[Python RAG] Chat response received`);
      return response.data;
    } catch (error: any) {
      console.error('[Python RAG] Failed to chat:', error.response?.data || error.message);
      throw new AppError(
        500,
        'RAG_CHAT_ERROR',
        `Failed to process chat: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  /**
   * Health check for Python RAG service
   */
  async healthCheck(): Promise<boolean> {
    try {
      await axios.get(`${PYTHON_RAG_BASE_URL}/health`, { timeout: 5000 });
      return true;
    } catch (error) {
      console.error('[Python RAG] Health check failed:', error);
      return false;
    }
  }
}

export const pythonRagService = new PythonRagService();

