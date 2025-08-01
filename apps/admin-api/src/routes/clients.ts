import { Router, Request, Response } from 'express';
import { SqlClientRepository } from '@naidp/db';
import { Client, ClientType } from '@naidp/domain';
import { createClientSchema, updateClientSchema } from '../validation/schemas';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const clientRepository = new SqlClientRepository();

// Get all clients
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let clients;
    if (type) {
      clients = await clientRepository.findByType(type as string);
    } else {
      clients = await clientRepository.findAll(offset, Number(limit));
    }

    const total = await clientRepository.count();

    res.json({
      clients: clients.map(client => ({
        id: client.id,
        name: client.name,
        type: client.type,
        clientId: client.clientId,
        redirectUris: client.redirectUris,
        allowedScopes: client.allowedScopes,
        isActive: client.isActive,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve clients'
    });
  }
});

// Get client by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await clientRepository.findById(id);

    if (!client) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Client not found'
      });
    }

    res.json({
      id: client.id,
      name: client.name,
      type: client.type,
      clientId: client.clientId,
      clientSecret: client.clientSecret ? '***' : undefined, // Hide secret
      redirectUris: client.redirectUris,
      allowedScopes: client.allowedScopes,
      metadata: client.metadata,
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve client'
    });
  }
});

// Create new client
router.post('/', async (req: Request, res: Response) => {
  try {
    const { error, value } = createClientSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    // Check if clientId already exists
    const existingClient = await clientRepository.findByClientId(value.clientId);
    if (existingClient) {
      return res.status(409).json({
        error: 'CONFLICT',
        message: 'Client ID already exists'
      });
    }

    const client = new Client({
      name: value.name,
      type: value.type as ClientType,
      clientId: value.clientId,
      clientSecret: value.clientSecret,
      redirectUris: value.redirectUris,
      allowedScopes: value.allowedScopes,
      metadata: value.metadata || {}
    });

    await clientRepository.save(client);

    res.status(201).json({
      id: client.id,
      name: client.name,
      type: client.type,
      clientId: client.clientId,
      redirectUris: client.redirectUris,
      allowedScopes: client.allowedScopes,
      metadata: client.metadata,
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create client'
    });
  }
});

// Update client
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateClientSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const client = await clientRepository.findById(id);
    
    if (!client) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Client not found'
      });
    }

    // Update client properties
    if (value.name) client.updateName(value.name);
    if (value.redirectUris) client.updateRedirectUris(value.redirectUris);
    if (value.allowedScopes) client.updateAllowedScopes(value.allowedScopes);
    if (value.metadata) client.updateMetadata(value.metadata);
    if (value.clientSecret) client.rotateSecret(value.clientSecret);
    if (value.isActive !== undefined) {
      value.isActive ? client.activate() : client.deactivate();
    }

    await clientRepository.save(client);

    res.json({
      id: client.id,
      name: client.name,
      type: client.type,
      clientId: client.clientId,
      redirectUris: client.redirectUris,
      allowedScopes: client.allowedScopes,
      metadata: client.metadata,
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update client'
    });
  }
});

// Delete client
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await clientRepository.findById(id);
    
    if (!client) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Client not found'
      });
    }

    await clientRepository.delete(id);

    res.json({
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to delete client'
    });
  }
});

// Rotate client secret
router.post('/:id/rotate-secret', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await clientRepository.findById(id);
    
    if (!client) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Client not found'
      });
    }

    const newSecret = uuidv4();
    client.rotateSecret(newSecret);
    await clientRepository.save(client);

    res.json({
      message: 'Client secret rotated successfully',
      clientSecret: newSecret
    });
  } catch (error) {
    console.error('Rotate secret error:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to rotate client secret'
    });
  }
});

export { router as clientsRouter };