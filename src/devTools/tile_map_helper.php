<?php
$tileFile = fopen("../constants/tile_map_temp.json", "r") or die("Unable to open file!");
$legacyTileFile = fopen("../constants/legacy_tile_map.json", "r") or die("Unable to open file!");
$tmpA = fread($tileFile, filesize("../constants/tile_map_temp.json"));
$tmpB = fread($legacyTileFile, filesize("../constants/legacy_tile_map.json"));
$tileJSON = json_decode($tmpA, true);
$legacyTileJSON = json_decode($tmpB, true);
foreach ($legacyTileJSON['tilePropertyArray'] as $key=>$item) {
    // echo "\nName: " . $key;
    // echo "\nType:";
    // var_dump($item['type']);
    // var_dump($item);
    // echo "\nLocations: ";
    // var_dump($item['locations']);
    foreach ($item['locations'] as $location) {
        $coords = explode(',', $location);
        echo "\n" . $coords[0] . "," . $coords[1] . "\n";
        $tile = $tileJSON[$coords[0]][$coords[1]];
        $tile['name'] = $item['name'];
        if (array_key_exists('automated', $item)) {
            $tile['automated'] = $item['automated'];
        }
        if (array_key_exists('targetType', $item)) {
            $tile['targetType'] = $item['targetType'];
        }
        if (array_key_exists('properties', $item)) {
            if (array_key_exists('resourceCostType', $item['properties'])) {
                $tile['resourceCostType'] = $item['properties']['resourceCostType'];
            }
            if (array_key_exists('resourceCostCount', $item['properties'])) {
                $tile['resourceCostCount'] = $item['properties']['resourceCostCount'];
            }
            if (array_key_exists('resourceYieldType', $item['properties'])) {
                $tile['resourceYieldType'] = $item['properties']['resourceYieldType'];
            }
            if (array_key_exists('resourceYieldCount', $item['properties'])) {
                $tile['resourceYieldCount'] = $item['properties']['resourceYieldCount'];
            }
        }
        // var_dump($tile);
        $tileJSON[$coords[0]][$coords[1]] = $tile;
    }
    
    echo "\n-------------";
}

$newJSON = json_encode($tileJSON);
$newTileFile = fopen("../constants/tile_map.json", "w") or die("Unable to open file!");
fwrite($newTileFile, $newJSON);
fclose($tileFile);
fclose($newTileFile);
fclose($legacyTileFile);
?>