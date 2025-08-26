/**
 * @rwsdk/design-prototype
 * 
 * Serve HTML design artifacts as RWSDK prototypes with dynamic data injection.
 * Perfect for rapid UI iteration and user testing before React conversion.
 * 
 * PLACEHOLDER - To be implemented as separate addon package
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export interface PrototypeConfig {
  /** Base directory for design artifacts */
  artifactsDir: string;
  /** Default template variables */
  defaultData?: Record<string, any>;
  /** Enable hot reloading in development */
  hotReload?: boolean;
  /** Custom template delimiters */
  delimiters?: {
    open: string;
    close: string;
  };
}

export interface TemplateData {
  /** Dynamic data to inject into template */
  data?: Record<string, any>;
  /** Request context (user, session, etc.) */
  context?: any;
  /** URL parameters */
  params?: Record<string, string>;
  /** Query parameters */
  query?: Record<string, string>;
}

export class DesignPrototype {
  private static config: PrototypeConfig = {
    artifactsDir: './design-artifacts',
    defaultData: {},
    hotReload: true,
    delimiters: { open: '{{', close: '}}' }
  };

  /**
   * Configure the design prototype system
   */
  static configure(config: Partial<PrototypeConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[PLACEHOLDER] DesignPrototype configured:', this.config);
  }

  /**
   * Serve an HTML file from design artifacts with optional data injection
   */
  static serve(filePath: string, templateData?: TemplateData): Response {
    try {
      console.log(`[PLACEHOLDER] Serving design artifact: ${filePath}`);
      
      // PLACEHOLDER: Read file from artifacts directory
      const fullPath = join(this.config.artifactsDir, filePath);
      console.log(`[PLACEHOLDER] Full path: ${fullPath}`);
      
      // PLACEHOLDER: For now, return a simple response
      // In real implementation: const html = readFileSync(fullPath, 'utf-8');
      
      // PLACEHOLDER: Inject template data
      const processedHtml = this.processTemplate(
        this.getPlaceholderHtml(filePath), 
        templateData
      );
      
      return new Response(processedHtml, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': this.config.hotReload ? 'no-cache' : 'public, max-age=3600'
        }
      });
    } catch (error) {
      console.error('[PLACEHOLDER] Error serving design artifact:', error);
      return new Response(this.getErrorHtml(filePath, error), {
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      });
    }
  }

  /**
   * Process template variables in HTML
   */
  static processTemplate(html: string, templateData?: TemplateData): string {
    if (!templateData?.data) return html;
    
    const { open, close } = this.config.delimiters!;
    let processedHtml = html;
    
    // PLACEHOLDER: Simple template replacement
    Object.entries(templateData.data).forEach(([key, value]) => {
      const regex = new RegExp(`${open}\\s*${key}\\s*${close}`, 'g');
      processedHtml = processedHtml.replace(regex, String(value));
    });
    
    console.log('[PLACEHOLDER] Template processed with data:', Object.keys(templateData.data));
    return processedHtml;
  }

  /**
   * Get list of available design artifacts
   */
  static async listArtifacts(): Promise<string[]> {
    // PLACEHOLDER: Scan artifacts directory
    console.log('[PLACEHOLDER] Listing design artifacts...');
    return [
      'dashboard/dashboard-v1.html',
      'delivery-screen/delivery-screen-v2.html',
      'find-freight/find-freight-v1.html',
      'location-scan/location-scan-v1.html',
      'warehouse-map/warehouse-map-v1.html'
    ];
  }

  /**
   * Validate artifact exists
   */
  static exists(filePath: string): boolean {
    try {
      // PLACEHOLDER: Check if file exists
      const fullPath = join(this.config.artifactsDir, filePath);
      console.log(`[PLACEHOLDER] Checking if ${fullPath} exists`);
      return true; // Placeholder - always return true
    } catch {
      return false;
    }
  }

  /**
   * Get artifact metadata
   */
  static getMetadata(filePath: string) {
    return {
      path: filePath,
      lastModified: new Date(),
      size: 1024,
      version: 'v1'
    };
  }

  // Private helper methods
  private static getPlaceholderHtml(filePath: string): string {
    // PLACEHOLDER: Return mock HTML based on file path
    if (filePath.includes('delivery-screen')) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - Delivery Screen</title>
    <style>
        body { font-family: Inter, sans-serif; margin: 0; background: #fefefe; }
        .container { max-width: 400px; margin: 0 auto; padding: 16px; }
        .delivery-header { background: #f9f8f6; padding: 16px; border-radius: 12px; margin-bottom: 24px; }
        .scan-button { background: #b45309; color: white; border: none; padding: 16px 24px; border-radius: 8px; font-size: 16px; width: 100%; margin-bottom: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="delivery-header">
            <h1>{{deliveryId}}</h1>
            <p>Status: {{status}}</p>
        </div>
        <button class="scan-button">📱 Scan Pallet</button>
        <p>[PLACEHOLDER] This HTML is served from design-artifacts/{{filePath}}</p>
    </div>
</body>
</html>`;
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design Prototype</title>
    <style>
        body { font-family: Inter, sans-serif; padding: 20px; background: #fefefe; }
        .placeholder { background: #f9f8f6; padding: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="placeholder">
        <h1>Design Prototype: ${filePath}</h1>
        <p>[PLACEHOLDER] This HTML would be served from design-artifacts/${filePath}</p>
        <p>Template data: {{data}}</p>
    </div>
</body>
</html>`;
  }

  private static getErrorHtml(filePath: string, error: any): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Design Artifact Not Found</title>
    <style>
        body { font-family: Inter, sans-serif; padding: 40px; background: #fefefe; }
        .error { background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; }
        .error h1 { color: #dc2626; margin: 0 0 16px 0; }
        .error code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="error">
        <h1>Design Artifact Not Found</h1>
        <p>Could not load: <code>${filePath}</code></p>
        <p>Error: ${error?.message || 'Unknown error'}</p>
        <p>Check that the file exists in your design-artifacts directory.</p>
    </div>
</body>
</html>`;
  }
}

/**
 * React-style hook for design prototypes (when converted to React)
 */
export interface UseDesignPrototype {
  serve: (filePath: string, data?: Record<string, any>) => Response;
  exists: (filePath: string) => boolean;
  listArtifacts: () => Promise<string[]>;
}

export function useDesignPrototype(): UseDesignPrototype {
  // PLACEHOLDER: React hook implementation
  return {
    serve: DesignPrototype.serve,
    exists: DesignPrototype.exists,
    listArtifacts: DesignPrototype.listArtifacts
  };
}

/**
 * Middleware for automatic artifact serving
 */
export function designPrototypeMiddleware(config?: Partial<PrototypeConfig>) {
  if (config) {
    DesignPrototype.configure(config);
  }
  
  return (request: Request) => {
    const url = new URL(request.url);
    
    // PLACEHOLDER: Auto-serve artifacts matching URL patterns
    if (url.pathname.startsWith('/prototype/')) {
      const artifactPath = url.pathname.replace('/prototype/', '') + '.html';
      return DesignPrototype.serve(artifactPath);
    }
    
    return null; // Pass through to next middleware
  };
}

export default DesignPrototype;