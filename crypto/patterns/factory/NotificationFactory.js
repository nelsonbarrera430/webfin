// Patrón Factory: Centraliza la creación de objetos de notificación

export class NotificationFactory {
    /**
     * @param {'info' | 'error' | 'success' | 'alert'} type 
     * @param {string} message 
     */
    static create(type, message) {
        return {
            id: self.crypto.randomUUID(), // ID único para gestión en React/etc.
            type: type,
            message: message,
            timestamp: Date.now(),
        };
    }
}