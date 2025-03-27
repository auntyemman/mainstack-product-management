
import { injectable } from 'inversify'

@injectable()
export class CachingService {
  private cache: Map<string, { value: any; expiresAt: number }> = new Map();


  set(key: string, value: any, ttl = 3600000): void {
    const expiresAt = Date.now() + ttl; // default to 1 hour if ttl not specified
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): any {
    const cached = this.cache.get(key);
    if (!cached || cached.expiresAt < Date.now()) {
      // Automatically remove expired entries from the cache
      this.cache.delete(key);
      return null;
    }
    return cached.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}
