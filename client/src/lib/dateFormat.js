export const dateFormat = (dateTime) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}  
