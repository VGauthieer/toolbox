import shodan 

import sys 

API_KEY = "key" 

api = shodan.Shodan(API_KEY) 

def lookup_target(): 

    target_ip = input("Entrez l'adresse IP cible pour la reconnaissance : ").strip()  

    if not target_ip: 

        print("Erreur : Vous devez entrer une adresse IP.") 

        return 

    print(f"\n--- Analyse de la cible : {target_ip} ---\n") 

    try: 

        results = api.host(target_ip)  

        print(f"Organisation : {results.get('org', 'N/A')}") 

        print(f"Système d'exploitation : {results.get('os', 'Inconnu')}") 

        print(f"Localisation : {results.get('city', 'N/A')}, {results.get('country_name', 'N/A')}") 

        print("\nPorts ouverts et Services détectés :") 

        for item in results['data']: 

            print(f"  [+] Port: {item['port']} | Service: {item['transport']} | Banner: {item['data'].strip()[:50]}...") 

    except shodan.APIError as e: 

        print(f"Erreur Shodan : {e}") 

    except Exception as e: 

        print(f"Une erreur inattendue est survenue : {e}") 

if __name__ == "__main__": 
    if len(sys.argv) < 2:
        print("Usage: python shodan.py <ip>")
        sys.exit(1)
    lookup_target(sys.argv[1])