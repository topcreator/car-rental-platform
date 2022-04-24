export default {
    signup: '/api/sign-up',
    confirmEmail: '/api/confirm-email/:email/:token',
    resendLink: '/api/resend-link',
    validateEmail: '/api/validate-email',
    signin: '/api/sign-in/:type',
    validateAccessToken: '/api/validate-access-token',
    getUser: '/api/user/:id',
    update: '/api/update-user',
    updateLanguage: '/api/update-language',
    updateEmailNotifications: '/api/update-email-notifications',
    resetPassword: '/api/reset-password',
    delete: '/api/delete-user/:id',
    updateAvatar: '/api/update-avatar/:userId',
    deleteAvatar: '/api/delete-avatar/:userId',
    search: '/api/users/:name/:page/:pageSize'
};