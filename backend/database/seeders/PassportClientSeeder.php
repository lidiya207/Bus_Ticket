<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Laravel\Passport\Client;
use Laravel\Passport\PersonalAccessClient;

class PassportClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if personal access client already exists
        $existingClient = Client::where('personal_access_client', true)
            ->where('provider', 'users')
            ->first();

        if ($existingClient) {
            $this->command->info('Personal access client already exists.');
            return;
        }

        // Create personal access client
        $client = Client::create([
            'name' => 'Laravel Personal Access Client',
            'secret' => Str::random(40),
            'personal_access_client' => true,
            'password_client' => false,
            'revoked' => false,
            'provider' => 'users',
        ]);

        // Create personal access client record
        PersonalAccessClient::firstOrCreate([
            'client_id' => $client->id,
        ]);

        $this->command->info('Personal access client created successfully!');
        $this->command->info('Client ID: ' . $client->id);
    }
}
