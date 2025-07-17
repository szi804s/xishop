package com.xishop.connector;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import okhttp3.*;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitTask;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

public final class XiShopConnector extends JavaPlugin {

    private OkHttpClient httpClient;
    private Gson gson;
    private String apiUrl;
    private String apiKey;
    private boolean debugMode;
    private BukkitTask commandCheckTask;

    @Override
    public void onEnable() {
        this.saveDefaultConfig();
        this.loadConfiguration();

        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .build();
        this.gson = new Gson();

        this.scheduleCommandChecker();
        Objects.requireNonNull(this.getCommand("xishop")).setExecutor(this);

        log(ChatColor.GREEN + "XiShopConnector has been enabled successfully!");
    }

    @Override
    public void onDisable() {
        if (commandCheckTask != null && !commandCheckTask.isCancelled()) {
            commandCheckTask.cancel();
        }
        log(ChatColor.YELLOW + "XiShopConnector has been disabled.");
    }
    
    public void loadConfiguration() {
        this.reloadConfig();
        this.apiKey = getConfig().getString("api-key", "NOT_SET");
        this.apiUrl = getConfig().getString("api-url", "https://api.xishop.com/v1/server");
        this.debugMode = getConfig().getBoolean("debug-mode", false);

        if (apiKey.equals("PASTE_YOUR_UNIQUE_API_KEY_HERE") || apiKey.equals("NOT_SET")) {
            getLogger().severe("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            getLogger().severe("API key is not set in config.yml! The plugin will not work.");
            getLogger().severe("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        }
    }

    private void scheduleCommandChecker() {
        if (commandCheckTask != null && !commandCheckTask.isCancelled()) {
            commandCheckTask.cancel();
        }
        long interval = getConfig().getLong("check-interval-seconds", 60) * 20; // Ticks
        this.commandCheckTask = getServer().getScheduler().runTaskTimerAsynchronously(this, this::fetchAndProcessCommands, 0L, interval);
    }

    private void fetchAndProcessCommands() {
        if (apiKey.equals("PASTE_YOUR_UNIQUE_API_KEY_HERE") || apiKey.equals("NOT_SET")) {
            debugLog("API key not set. Skipping command check.");
            return;
        }

        debugLog("Fetching commands from API...");
        Request request = new Request.Builder()
                .url(apiUrl + "/commands/fetch")
                .header("Authorization", "Bearer " + apiKey)
                .header("User-Agent", "XiShopConnector/" + getDescription().getVersion())
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                logError("Failed to fetch commands. HTTP Status: " + response.code());
                if (response.body() != null) {
                    debugLog("Response Body: " + response.body().string());
                }
                return;
            }

            String responseBody = Objects.requireNonNull(response.body()).string();
            debugLog("API Response: " + responseBody);

            JsonObject json = gson.fromJson(responseBody, JsonObject.class);
            if (json.has("data") && json.get("data").isJsonArray()) {
                JsonArray commands = json.getAsJsonArray("data");
                if (commands.size() > 0) {
                    processCommands(commands);
                } else {
                    debugLog("No new commands to process.");
                }
            }
        } catch (IOException e) {
            logError("An I/O error occurred while fetching commands: " + e.getMessage());
        } catch (Exception e) {
            logError("An unexpected error occurred: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void processCommands(JsonArray commands) {
        List<Integer> commandIds = new ArrayList<>();

        for (int i = 0; i < commands.size(); i++) {
            JsonObject cmdObj = commands.get(i).getAsJsonObject();
            int id = cmdObj.get("id").getAsInt();
            String playerName = cmdObj.get("player_name").getAsString();
            String commandLine = cmdObj.get("command_line").getAsString();

            commandIds.add(id);

            String finalCommand = commandLine.replace("{player}", playerName);

            log("Executing command for " + playerName + ": " + finalCommand);

            // Execute command on the main server thread
            getServer().getScheduler().runTask(this, () -> {
                Bukkit.dispatchCommand(Bukkit.getConsoleSender(), finalCommand);
            });
        }
        
        if (!commandIds.isEmpty()) {
            acknowledgeCommands(commandIds);
        }
    }

    private void acknowledgeCommands(List<Integer> commandIds) {
        JsonObject payload = new JsonObject();
        JsonArray idsArray = new JsonArray();
        commandIds.forEach(idsArray::add);
        payload.add("command_ids", idsArray);

        RequestBody body = RequestBody.create(payload.toString(), MediaType.get("application/json; charset=utf-8"));
        
        Request request = new Request.Builder()
                .url(apiUrl + "/commands/acknowledge")
                .header("Authorization", "Bearer " + apiKey)
                .post(body)
                .build();
        
        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                logError("Failed to acknowledge commands: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    debugLog("Successfully acknowledged " + commandIds.size() + " commands.");
                } else {
                    logError("Failed to acknowledge commands. Status: " + response.code());
                    debugLog("Acknowledge Response: " + response.body().string());
                }
                response.close();
            }
        });
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            sender.sendMessage(ChatColor.GOLD + "[XiShop] " + ChatColor.WHITE + "Version " + getDescription().getVersion());
            return true;
        }

        switch (args[0].toLowerCase()) {
            case "reload":
                if (!sender.hasPermission("xishop.reload")) {
                    sender.sendMessage(ChatColor.RED + "You do not have permission to use this command.");
                    return true;
                }
                loadConfiguration();
                scheduleCommandChecker();
                sender.sendMessage(ChatColor.GREEN + "XiShopConnector configuration reloaded.");
                break;
            case "forcecheck":
                if (!sender.hasPermission("xishop.forcecheck")) {
                    sender.sendMessage(ChatColor.RED + "You do not have permission to use this command.");
                    return true;
                }
                sender.sendMessage(ChatColor.AQUA + "Forcing a check for new commands...");
                getServer().getScheduler().runTaskAsynchronously(this, this::fetchAndProcessCommands);
                break;
            case "status":
                 if (!sender.hasPermission("xishop.status")) {
                    sender.sendMessage(ChatColor.RED + "You do not have permission to use this command.");
                    return true;
                }
                sender.sendMessage(ChatColor.GOLD + "--- XiShopConnector Status ---");
                sender.sendMessage(ChatColor.GRAY + "Version: " + ChatColor.WHITE + getDescription().getVersion());
                sender.sendMessage(ChatColor.GRAY + "Debug Mode: " + ChatColor.WHITE + debugMode);
                sender.sendMessage(ChatColor.GRAY + "API URL: " + ChatColor.WHITE + apiUrl);
                sender.sendMessage(ChatColor.GRAY + "API Key Set: " + ChatColor.WHITE + (!apiKey.equals("PASTE_YOUR_UNIQUE_API_KEY_HERE")));
                break;
            default:
                sender.sendMessage(ChatColor.RED + "Unknown sub-command. Use /xishop [reload|forcecheck|status]");
                break;
        }
        return true;
    }

    private void log(String message) {
        getLogger().info(message);
    }
    
    private void logError(String message) {
        getLogger().severe(message);
    }
    
    private void debugLog(String message) {
        if (debugMode) {
            getLogger().info("[DEBUG] " + message);
        }
    }
} 