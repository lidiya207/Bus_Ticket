<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);

        Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'api']);
        $user->assignRole('customer');

        $tokenData = $this->issueToken($user);

        return response()->json([
            'message' => 'Registration successful.',
            'data' => [
                'user' => $user->load('roles'),
                'token' => $tokenData['access_token'] ?? $tokenData['token'],
            ],
        ], Response::HTTP_CREATED);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $user->update(['last_login_at' => now()]);

        $tokenData = $this->issueToken($user);

        return response()->json([
            'message' => 'Login successful.',
            'data' => [
                'user' => $user->load('roles'),
                'token' => $tokenData['access_token'] ?? $tokenData['token'],
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->load('roles'),
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->load('roles'),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()->token();
        if ($token) {
            $token->revoke();
        }

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => __($status)])
            : response()->json(['message' => __($status)], 422);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => __($status)])
            : response()->json(['message' => __($status)], 422);
    }

    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles');

        if ($request->filled('role')) {
            $query->role($request->role);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function createUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'in:admin,cashier,customer'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        return response()->json([
            'message' => 'User created successfully.',
            'data' => $user->load('roles'),
        ], Response::HTTP_CREATED);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Cannot delete your own account.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    protected function issueToken(User $user): array
    {
        $ability = $user->getRoleNames()->first() ?? 'customer';

        $token = $user->createToken('bus-ticket', [$ability]);

        return [
            'token' => $token->accessToken,
            'access_token' => $token->accessToken,
            'token_type' => 'Bearer',
            'abilities' => $token->token->scopes,
            'expires_at' => $token->token->expires_at,
        ];
    }
}
