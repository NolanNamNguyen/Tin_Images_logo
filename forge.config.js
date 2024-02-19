module.exports = {
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        authToken: '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',
        repository: {
          owner: 'NolanNamNguyen',
          name: 'Tin_Images_logo'
        },
        prerelease: false,
        draft: true
      }
    }
  ]
}