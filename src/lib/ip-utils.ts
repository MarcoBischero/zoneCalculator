/**
 * Utility functions for IP address extraction and handling
 */

/**
 * Extracts the client IP address from a Next.js request object
 * Handles proxy servers and load balancers by checking x-forwarded-for and other headers
 * 
 * @param request - Next.js Request object
 * @returns Client IP address or '0.0.0.0' if unable to determine
 */
export function getClientIp(request: Request): string {
    // Check x-forwarded-for header (most common for proxies/load balancers)
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
        // The first one is the original client
        const ips = forwardedFor.split(',').map(ip => ip.trim());
        if (ips[0]) {
            return ips[0];
        }
    }

    // Check x-real-ip header (nginx)
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    // Check CF-Connecting-IP (Cloudflare)
    const cfIp = request.headers.get('cf-connecting-ip');
    if (cfIp) {
        return cfIp;
    }

    // Check x-client-ip
    const clientIp = request.headers.get('x-client-ip');
    if (clientIp) {
        return clientIp;
    }

    // Fallback: unable to determine
    return '0.0.0.0';
}

/**
 * Validates if a string is a valid IPv4 or IPv6 address
 * @param ip - IP address string to validate
 * @returns true if valid IP address
 */
export function isValidIp(ip: string): boolean {
    // IPv4 regex
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    // IPv6 regex (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;

    if (ipv4Regex.test(ip)) {
        // Validate each octet is 0-255
        const octets = ip.split('.');
        return octets.every(octet => {
            const num = parseInt(octet, 10);
            return num >= 0 && num <= 255;
        });
    }

    return ipv6Regex.test(ip);
}
