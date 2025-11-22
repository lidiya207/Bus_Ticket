<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Carbon;
use Laravel\Passport\Passport;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        Passport::tokensExpireIn(Carbon::now()->addMinutes(120));
        Passport::refreshTokensExpireIn(Carbon::now()->addDays(7));
        Passport::personalAccessTokensExpireIn(Carbon::now()->addMonths(6));

        Passport::tokensCan([
            'admin' => 'Full administrative privileges',
            'cashier' => 'Manage cashier operations',
            'customer' => 'Book and manage personal tickets',
        ]);
    }
}
